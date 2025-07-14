# 🧠 ModMatch – AI-Powered Ticket Routing System

ModMatch is a full-stack platform that intelligently routes student queries (tickets) to the most relevant moderator using AI. It's designed for educational support teams to streamline query handling and reduce manual triaging.

Built with:

- ✨ **Next.js** (frontend)
- 🔧 **Express.js + MongoDB** (backend)
- 🤖 **Inngest + Gemini AI** (ticket analysis & AI replies)
- 💅 **ShadCN/UI** (modern and responsive UI)

---

## 🚀 Features

- 🔐 **Role-based Authentication**: Admin, Moderator, and User dashboards.
- 📝 **Ticket Submission**: Users can submit questions with titles and descriptions.
- 🧠 **AI Ticket Enrichment**: Tickets are analyzed using Gemini AI to extract:
  - Priority level
  - Helpful notes
  - Related skills
- 🧑‍⚖️ **Smart Assignment**: Moderators are auto-assigned based on matching skills.
- 💬 **Threaded Comments**: Admins/Moderators can reply to tickets.
- 🧠 **AI Reply Assistance**: Option to auto-generate replies using Gemini.
- ✅ **Status Management**: Close tickets with 1 click.
- 📊 **Admin Dashboard**: View all users, update roles, edit skills.
- 📦 **Deployed on Vercel + Render**.

---


## 🛠️ Tech Stack

| Frontend        | Backend       | AI / Infra           |
|------------------|----------------|----------------------|
| Next.js 13+       | Node.js (Express) | Inngest + Gemini API |
| TypeScript        | MongoDB        | JWT Auth             |
| ShadCN/UI         | REST API       | Render + Vercel      |

---

## 🧪 Local Development

### 1. Clone the repo
```bash
git clone https://github.com/your-username/modmatch.git
cd modmatch

2. Add environment variables

Backend → Create a .env file in /backend:
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
INNGEST_SIGNING_KEY=your_inngest_signing_key

3. Install dependencies
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install

4. Run the app

In two terminals (or use concurrently):
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev






