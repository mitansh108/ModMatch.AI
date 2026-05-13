import IORedis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

/**
 * Shared ioredis connection used by BullMQ (queues + workers) and the
 * health endpoint. BullMQ requires `maxRetriesPerRequest: null` and
 * `enableReadyCheck: false` on connections it owns so that blocking
 * commands (BRPOPLPUSH, XREAD, etc.) can run indefinitely without being
 * retried or torn down.
 */
const redisUrl = process.env.REDIS_URL;

const baseOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  // Exponential reconnect with a sane ceiling.
  retryStrategy: (times) => Math.min(times * 200, 5000),
};

export const redisConnection = redisUrl
  ? new IORedis(redisUrl, baseOptions)
  : new IORedis({
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      username: process.env.REDIS_USERNAME || undefined,
      db: Number(process.env.REDIS_DB) || 0,
      ...baseOptions,
    });

redisConnection.on("connect", () => {
  console.log("🔌 Redis connecting...");
});

redisConnection.on("ready", () => {
  console.log("✅ Redis connection ready");
});

redisConnection.on("error", (err) => {
  console.error("❌ Redis error:", err.message);
});

redisConnection.on("close", () => {
  console.warn("⚠️  Redis connection closed");
});

redisConnection.on("reconnecting", (delay) => {
  console.warn(`🔁 Redis reconnecting in ${delay}ms`);
});

/**
 * Pings Redis and returns a snapshot suitable for the /health endpoint.
 * Resolves with { ok, status, latencyMs } and never throws.
 */
export async function pingRedis() {
  const start = Date.now();
  try {
    const pong = await redisConnection.ping();
    return {
      ok: pong === "PONG",
      status: redisConnection.status,
      latencyMs: Date.now() - start,
    };
  } catch (err) {
    return {
      ok: false,
      status: redisConnection.status,
      error: err.message,
      latencyMs: Date.now() - start,
    };
  }
}

export async function closeRedis() {
  try {
    await redisConnection.quit();
  } catch {
    redisConnection.disconnect();
  }
}

export default redisConnection;
