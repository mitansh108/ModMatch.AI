import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import { serve } from "inngest/express"
import userRoutes from "./routes/user.js"
import ticketRoutes from "./routes/ticket.js"
import commentRoutes from "./routes/comment.js"
import { inngest } from "./inngest/client.js"
import { onUserSignup } from "./inngest/functions/on-signup.js"
import { onTicketCreated } from "./inngest/functions/on-ticket.js"
import aiRoutes from "./routes/ai.js"

import dotenv from "dotenv"

import { pingRedis, redisConnection, closeRedis } from "./config/redis.js"
import {
  ticketTriageQueue,
  TICKET_TRIAGE_QUEUE,
  closeQueue,
} from "./config/queue.js"
import { createTicketWorker } from "./workers/ticketWorker.js"

dotenv.config()

const PORT = process.env.PORT || 3000
const RUN_WORKER_IN_API = process.env.RUN_WORKER_IN_API !== "false"

const app = express()

app.use(
  cors({
    origin: [
      "https://modmatch-ai.onrender.com",
      "https://mod-match-ai.vercel.app",
      "http://localhost:3001",
    ],
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  })
)

app.use(express.json())

// Routes
app.use("/api/auth", userRoutes)
app.use("/api/tickets", ticketRoutes)
app.use("/api/ai", aiRoutes)
app.use("/api/tickets", commentRoutes)

// Inngest (legacy async path — kept mounted but the producer is gated off
// in controllers/ticket.js so existing functions can be re-enabled by
// uncommenting `inngest.send(...)` there).
app.use(
  "/api/inngest",
  serve({
    client: inngest,
    functions: [onUserSignup, onTicketCreated],
  })
)

/**
 * Liveness + Redis health probe.
 *
 * Returns 200 only when Redis responds to PING. Useful for load
 * balancers, k8s readinessProbe, and Render's health check setting.
 */
app.get("/health", async (_req, res) => {
  const redis = await pingRedis()
  const mongoStateMap = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  }
  const mongoState = mongoStateMap[mongoose.connection.readyState] || "unknown"

  let queueCounts = null
  let queueError = null
  try {
    queueCounts = await ticketTriageQueue.getJobCounts(
      "waiting",
      "active",
      "delayed",
      "failed",
      "completed"
    )
  } catch (err) {
    queueError = err.message
  }

  const healthy = redis.ok && mongoState === "connected"

  return res.status(healthy ? 200 : 503).json({
    status: healthy ? "ok" : "degraded",
    uptimeSeconds: Math.floor(process.uptime()),
    redis,
    mongo: { state: mongoState },
    queue: {
      name: TICKET_TRIAGE_QUEUE,
      counts: queueCounts,
      error: queueError,
    },
  })
})

// MongoDB connection → then start HTTP server (and worker if enabled)
let server
let ticketWorker

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected")

    if (RUN_WORKER_IN_API) {
      ticketWorker = createTicketWorker()
    } else {
      console.log("ℹ️  RUN_WORKER_IN_API=false — skipping in-process worker")
    }

    server = app.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
    )
  })
  .catch((err) => console.error("MongoDB error:", err))

// Graceful shutdown so in-flight jobs finish and Redis/Mongo disconnect cleanly.
async function shutdown(signal) {
  console.log(`\n🛑 Received ${signal}, shutting down gracefully...`)
  try {
    if (server) {
      await new Promise((resolve) => server.close(resolve))
    }
    if (ticketWorker) {
      await ticketWorker.close()
    }
    await closeQueue()
    await mongoose.connection.close()
    await closeRedis()
  } catch (err) {
    console.error("⚠️  Error during shutdown:", err.message)
  } finally {
    process.exit(0)
  }
}

process.on("SIGINT", () => shutdown("SIGINT"))
process.on("SIGTERM", () => shutdown("SIGTERM"))

// Surface the Redis client so other modules can introspect connection
// state via app.locals if needed (e.g. admin diagnostics).
app.locals.redis = redisConnection
app.locals.ticketTriageQueue = ticketTriageQueue
