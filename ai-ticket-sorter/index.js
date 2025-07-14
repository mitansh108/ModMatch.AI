import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import { serve } from "inngest/express"
import userRoutes from "./routes/user.js"
import ticketRoutes from "./routes/ticket.js"
import commentRoutes from "./routes/comment.js" // ✅ added
import { inngest } from "./inngest/client.js"
import { onUserSignup } from "./inngest/functions/on-signup.js"
import { onTicketCreated } from "./inngest/functions/on-ticket.js"
import dotenv from "dotenv"

dotenv.config()

const PORT = process.env.PORT || 3000
const app = express()

app.use(
  cors({
    origin: [
      "https://modmatch-ai.onrender.com",     // optional backend endpoint
      "https://mod-match-ai.vercel.app",      // ✅ frontend
      "http://localhost:3001",                // for local dev
    ],
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  })
)

app.use(express.json())

// Routes
app.use("/api/auth", userRoutes)
app.use("/api/tickets", ticketRoutes)
app.use("/api/tickets", commentRoutes) // ✅ comment routes mounted under same path

// Inngest
app.use(
  "/api/inngest",
  serve({
    client: inngest,
    functions: [onUserSignup, onTicketCreated],
  })
)

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected")
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
  })
  .catch((err) => console.error("MongoDB error:", err))
