import { Worker } from "bullmq";
import mongoose from "mongoose";
import dotenv from "dotenv";

import { redisConnection } from "../config/redis.js";
import { TICKET_TRIAGE_QUEUE } from "../config/queue.js";
import Ticket from "../ai-models/ticket.js";
import User from "../ai-models/user.js";
import analyzeTicket from "../utils/ai.js";
import { sendMail } from "../utils/mailer.js";

dotenv.config();

const WORKER_CONCURRENCY = Number(process.env.TICKET_WORKER_CONCURRENCY) || 5;
const RATE_LIMIT_MAX = Number(process.env.TICKET_RATE_LIMIT_MAX) || 10;
const RATE_LIMIT_DURATION_MS =
  Number(process.env.TICKET_RATE_LIMIT_DURATION_MS) || 60_000;

const VALID_PRIORITIES = new Set(["low", "medium", "high"]);

/**
 * Core triage pipeline — extracted so it can be unit tested independently
 * of BullMQ. Mirrors the existing Inngest `onTicketCreated` flow.
 */
async function processTicketTriage(job) {
  const { ticketId } = job.data || {};
  if (!ticketId) {
    throw new Error("Job payload missing required ticketId");
  }

  console.log(`🟡 [worker] processing job ${job.id} ticket=${ticketId} attempt=${job.attemptsMade + 1}`);

  const ticket = await Ticket.findById(ticketId);
  if (!ticket) {
    // Non-retryable: ticket was deleted between enqueue and processing.
    const err = new Error(`Ticket ${ticketId} not found`);
    err.isUnrecoverable = true;
    throw err;
  }

  await Ticket.findByIdAndUpdate(ticket._id, { status: "TODO" });

  const aiResponse = await analyzeTicket(ticket);
  if (!aiResponse) {
    throw new Error("AI analysis returned null — will retry");
  }

  const priority = VALID_PRIORITIES.has(aiResponse.priority)
    ? aiResponse.priority
    : "medium";
  const relatedSkills = Array.isArray(aiResponse.relatedSkills)
    ? aiResponse.relatedSkills
    : [];

  await Ticket.findByIdAndUpdate(ticket._id, {
    priority,
    helpfulNotes: aiResponse.helpfulNotes,
    status: "IN_PROGRESS",
    relatedSkills,
  });

  // Skill-based moderator matching with admin fallback.
  let assignee = null;
  if (relatedSkills.length > 0) {
    assignee = await User.findOne({
      role: "moderator",
      skills: {
        $elemMatch: {
          $regex: relatedSkills.join("|"),
          $options: "i",
        },
      },
    });
  }

  if (!assignee) {
    console.log(`⚠️  [worker] no moderator skills match for ${ticketId}, falling back to admin`);
    assignee = await User.findOne({ role: "admin" });
  }

  await Ticket.findByIdAndUpdate(ticket._id, {
    assignedTo: assignee?._id || null,
  });

  if (assignee?.email) {
    const finalTicket = await Ticket.findById(ticket._id);
    await sendMail(
      assignee.email,
      "Ticket Assigned",
      `A new ticket is assigned to you: ${finalTicket.title}`
    );
    console.log(`📧 [worker] notified ${assignee.email} for ticket ${ticketId}`);
  } else {
    console.warn(`⚠️  [worker] no assignee available for ticket ${ticketId}; skipping email`);
  }

  return {
    ticketId: ticket._id.toString(),
    priority,
    relatedSkills,
    assignedTo: assignee?._id?.toString() || null,
  };
}

/**
 * Build the BullMQ worker. Lazy so the same module can be imported by
 * the API process without immediately spinning up a worker.
 */
export function createTicketWorker() {
  const worker = new Worker(TICKET_TRIAGE_QUEUE, processTicketTriage, {
    connection: redisConnection,
    concurrency: WORKER_CONCURRENCY,
    limiter: {
      // Respects Gemini API limits — at most N jobs every `duration` ms,
      // across all workers sharing this Redis instance.
      max: RATE_LIMIT_MAX,
      duration: RATE_LIMIT_DURATION_MS,
    },
  });

  worker.on("ready", () => {
    console.log(
      `🛠️  ticket-triage worker ready (concurrency=${WORKER_CONCURRENCY}, ` +
      `rate=${RATE_LIMIT_MAX}/${RATE_LIMIT_DURATION_MS}ms)`
    );
  });

  worker.on("active", (job) => {
    console.log(`▶️  [worker] active job ${job.id}`);
  });

  worker.on("completed", (job, result) => {
    console.log(`✅ [worker] completed job ${job.id} →`, result);
  });

  worker.on("failed", (job, err) => {
    const attempt = job?.attemptsMade ?? "?";
    const max = job?.opts?.attempts ?? "?";
    console.error(`❌ [worker] job ${job?.id} failed (attempt ${attempt}/${max}): ${err.message}`);
  });

  worker.on("error", (err) => {
    console.error("❌ [worker] runtime error:", err.message);
  });

  return worker;
}

/**
 * When run as a standalone process (`node workers/ticketWorker.js`),
 * connect to Mongo first then start the worker. When imported from
 * `index.js`, the consumer is responsible for ensuring Mongo is
 * connected before invoking `createTicketWorker()`.
 */
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  const start = async () => {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is required to start the ticket worker");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("📦 [worker] MongoDB connected");

    const worker = createTicketWorker();

    const shutdown = async (signal) => {
      console.log(`\n🛑 [worker] received ${signal}, shutting down...`);
      try {
        await worker.close();
        await mongoose.connection.close();
        await redisConnection.quit();
      } catch (err) {
        console.error("⚠️  [worker] error during shutdown:", err.message);
      } finally {
        process.exit(0);
      }
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  };

  start().catch((err) => {
    console.error("❌ [worker] failed to start:", err);
    process.exit(1);
  });
}

export { processTicketTriage };
