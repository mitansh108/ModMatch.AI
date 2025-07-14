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

## 📸 Screenshots

| User Ticket Form | Admin Ticket View |
|------------------|-------------------|
| ![User Form](./screenshots/user-form.png) | ![Admin Panel](./screenshots/admin-panel.png) |

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
