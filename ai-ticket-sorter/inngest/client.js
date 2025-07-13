import { Inngest } from "inngest";

export const inngest = new Inngest({
  name: "ModMatch",
  eventKey: process.env.INNGEST_EVENT_KEY, // ✅ this is now your signing key reused
});
