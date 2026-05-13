import { Queue, QueueEvents } from "bullmq";
import { redisConnection } from "./redis.js";

export const TICKET_TRIAGE_QUEUE = "ticket-triage";

/**
 * Default job options for every job pushed onto `ticket-triage`.
 *
 * - attempts:  total tries including the first one.
 * - backoff:   exponential — 5s, 10s, 20s between retries.
 * - removeOnComplete: cap successful job history so Redis doesn't grow
 *   unbounded under load.
 * - removeOnFail: keep recent failures around for debugging.
 */
export const DEFAULT_JOB_OPTIONS = {
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 5000,
  },
  removeOnComplete: { age: 3600, count: 1000 },
  removeOnFail: { age: 24 * 3600, count: 1000 },
};

export const ticketTriageQueue = new Queue(TICKET_TRIAGE_QUEUE, {
  connection: redisConnection,
  defaultJobOptions: DEFAULT_JOB_OPTIONS,
});

/**
 * QueueEvents is optional but lets us observe completion/failure
 * lifecycle events from the producer side (controllers, health checks).
 */
export const ticketTriageQueueEvents = new QueueEvents(TICKET_TRIAGE_QUEUE, {
  connection: redisConnection,
});

ticketTriageQueueEvents.on("failed", ({ jobId, failedReason }) => {
  console.error(`🟥 [queue] job ${jobId} failed: ${failedReason}`);
});

ticketTriageQueueEvents.on("completed", ({ jobId }) => {
  console.log(`🟩 [queue] job ${jobId} completed`);
});

/**
 * Adds a ticket triage job to the queue.
 *
 * @param {object} payload    - { ticketId, title, description, createdBy }
 * @param {object} [overrides] - optional per-job overrides for BullMQ JobsOptions
 */
export async function enqueueTicketTriage(payload, overrides = {}) {
  const jobName = "triage-ticket";
  return ticketTriageQueue.add(jobName, payload, {
    jobId: `ticket:${payload.ticketId}`, // dedupe — one job per ticket id
    ...overrides,
  });
}

export async function closeQueue() {
  await Promise.allSettled([
    ticketTriageQueueEvents.close(),
    ticketTriageQueue.close(),
  ]);
}
