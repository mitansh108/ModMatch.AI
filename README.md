# ModMatch.AI — AI-Powered Ticket Routing System

ModMatch is a full-stack platform that intelligently routes student support tickets to the most relevant moderator using AI. Built for educational support teams that want to streamline query handling, eliminate manual triage, and respect upstream LLM rate limits under load.

> **Note**: The frontend lives in `smart-tickets/` (Next.js) and the backend lives in `ai-ticket-sorter/` (Express).

---

## ✨ What's inside

- **Role-based auth** — Admin, Moderator, and User dashboards (JWT).
- **AI-enriched tickets** — Gemini analyses every ticket and extracts priority, helpful notes, and related skills.
- **Skill-based routing** — moderators are auto-assigned via regex match on their skill list, with admin fallback.
- **Threaded comments + AI reply suggestions** — moderators can hand off the first draft to Gemini.
- **Redis-backed job queue** — BullMQ sits between ticket creation and Gemini so 100 concurrent submissions don't hammer the API.
- **Rate limiting** — the worker is throttled to **10 jobs/minute** with **concurrency 5** and **3-attempt exponential backoff** on failure.
- **Health probe** — `GET /health` reports Redis ping, Mongo state, and live queue counts.
- **Graceful shutdown** — `SIGINT`/`SIGTERM` drain in-flight jobs and close Mongo/Redis cleanly.

---

## 🏗️ Architecture

```
                                ┌──────────────────────────────┐
   Next.js UI ──HTTP──▶  Express API ──enqueue──▶│   Redis  (BullMQ queue)      │
   (smart-tickets)        (ai-ticket-sorter)     │   "ticket-triage"            │
                                │                └──────────────┬───────────────┘
                                │                               │
                                ▼                               ▼
                          MongoDB (Atlas)              BullMQ Worker
                          tickets / users              concurrency: 5
                                ▲                      limiter: 10/min
                                │                               │
                                │              ┌────────────────┼──────────────┐
                                │              ▼                ▼              ▼
                                │       Gemini (AI triage)  Mongo update  Mailtrap SMTP
                                └─────────────────────update ticket + assign moderator
```

Why a queue? The original flow called `inngest.send()` on every ticket creation, which fanned out to a single Inngest function that immediately hit Gemini. Under burst load (say, 100 students submitting at once during an exam), every call hit Gemini simultaneously and the free-tier rate limit kicked in, causing cascading failures. BullMQ smooths that into a steady **10 calls/minute** so the upstream LLM stays happy and ticket processing degrades gracefully (queue grows) instead of failing.

The legacy Inngest path is kept in the controller (commented out) so the system can be rolled back to the old flow in one line.

---

## 🛠️ Tech Stack

| Frontend             | Backend                | Async / AI / Infra              |
| -------------------- | ---------------------- | ------------------------------- |
| Next.js (Pages dir)  | Express 5 (ES modules) | **BullMQ + ioredis** (queue)    |
| TypeScript           | MongoDB + Mongoose     | Gemini via `@inngest/agent-kit` |
| ShadCN UI + Tailwind | JWT auth middleware    | Inngest (legacy, rollback path) |
|                      | Nodemailer / Mailtrap  | Vercel + Render                 |

---

## 🚀 Local Development

### Prerequisites

- Node.js 18+
- A running Redis instance (local or hosted)
- A MongoDB Atlas cluster (or local Mongo)
- A Gemini API key from [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

### 1. Clone

```bash
git clone https://github.com/mitansh108/ModMatch.AI.git
cd ModMatch.AI
```

### 2. Start Redis locally

macOS (Homebrew):

```bash
brew install redis
brew services start redis
redis-cli ping        # → PONG
```

Or via Docker:

```bash
docker run -d --name modmatch-redis -p 6379:6379 redis:7-alpine
```

### 3. Configure backend env vars

```bash
cd ai-ticket-sorter
cp .env.example .env
# then edit .env with your real values
```

Minimum required keys (see `ai-ticket-sorter/.env.example` for the full list):

```bash
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>
JWT_SECRET=replace-me
GEMINI_API_KEY=your-gemini-key
REDIS_URL=redis://127.0.0.1:6379

# SMTP for the assignment-notification emails (Mailtrap works for dev)
MAILTRAP_SMTP_HOST=sandbox.smtp.mailtrap.io
MAILTRAP_SMTP_PORT=2525
MAILTRAP_SMTP_USER=...
MAILTRAP_SMTP_PASS=...
```

Optional worker tuning (defaults shown):

```bash
TICKET_WORKER_CONCURRENCY=5
TICKET_RATE_LIMIT_MAX=10
TICKET_RATE_LIMIT_DURATION_MS=60000
RUN_WORKER_IN_API=true    # set false to run the worker as a separate process
```

### 4. Install & run

```bash
# Backend (also boots the BullMQ worker in-process)
cd ai-ticket-sorter
npm install
npm run dev

# Frontend, in a second terminal
cd ../smart-tickets
npm install
npm run dev
```

Expected backend startup logs:

```
🔌 Redis connecting...
✅ Redis connection ready
MongoDB connected
🛠️  ticket-triage worker ready (concurrency=5, rate=10/60000ms)
🚀 Server running on port 3000
```

### 5. Verify the pipeline

```bash
# 1. Health probe — all three subsystems should be green
curl -s http://localhost:3000/health | jq

# 2. Create a ticket (substitute your own JWT)
curl -s -X POST http://localhost:3000/api/tickets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"smoke test","description":"verify the queue end-to-end"}' | jq

# 3. Watch the queue process it
curl -s http://localhost:3000/health | jq .queue.counts
```

In the backend terminal you'll see:

```
📨 Enqueued ticket triage job ticket:<id>
▶️  [worker] active job ticket:<id>
✅ [worker] completed job ticket:<id>
```

---

## 📂 Project Layout

```
ai-ticket-sorter/                # Express backend
├── config/
│   ├── redis.js                 # Shared ioredis client + health helpers
│   └── queue.js                 # BullMQ "ticket-triage" queue + enqueue helper
├── workers/
│   └── ticketWorker.js          # BullMQ worker (concurrency 5, 10/min limiter, 3 retries)
├── controllers/
│   └── ticket.js                # createTicket now enqueues; Inngest path kept (commented)
├── inngest/                     # Legacy async path (kept for one-line rollback)
├── ai-models/                   # Mongoose schemas
├── routes/                      # Express routers
├── utils/
│   ├── ai.js                    # Gemini wrapper (analyzeTicket)
│   └── mailer.js                # Nodemailer / Mailtrap
├── middlewares/auth.js          # JWT auth
└── index.js                     # App bootstrap, /health endpoint, graceful shutdown

smart-tickets/                   # Next.js frontend (Pages dir + ShadCN)
```

---

## 🔄 Rollback to the legacy Inngest path

If Redis is unavailable and you need to revert to the pre-queue behaviour:

1. Open `ai-ticket-sorter/controllers/ticket.js`.
2. Comment out the `enqueueTicketTriage(...)` block.
3. Uncomment the `inngest.send(...)` block right below it.
4. Restart the API.

No other changes are required — the Inngest function (`onTicketCreated`) is still mounted at `/api/inngest`.

---

## 🌐 Deployment

| Service       | Host       | Notes                                                          |
| ------------- | ---------- | -------------------------------------------------------------- |
| Frontend      | Vercel     | Set `NEXT_PUBLIC_API_URL` to your backend URL.                 |
| Backend       | Render     | Add all backend env vars including `REDIS_URL`.                |
| Redis         | Upstash    | Use the `rediss://` URL — `ioredis` enables TLS automatically. |
| MongoDB       | Atlas      | Whitelist your Render egress IPs (or `0.0.0.0/0` for dev).     |

For higher throughput, run `node workers/ticketWorker.js` as a separate Render service with `RUN_WORKER_IN_API=false` on the API service.

---

## 📜 License

MIT — do whatever you want, just don't blame me when it breaks.
