import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "modmatch-app",           // ✅ Required in latest SDK
  name: "ModMatch",             // Optional but helpful for dashboard
  eventKey: process.env.INNGEST_EVENT_KEY,
});
