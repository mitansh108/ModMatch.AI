import { inngest } from "../client.js";
import Ticket from "../../ai-models/ticket.js";
import User from "../../ai-models/user.js";
import { NonRetriableError } from "inngest";
import { sendMail } from "../../utils/mailer.js";
import analyzeTicket from "../../utils/ai.js";

export const onTicketCreated = inngest.createFunction(
  { id: "on-ticket-created", retries: 2 },
  { event: "ticket/created" },
  async ({ event, step }) => {
    try {
      const { ticketId } = event.data;
      console.log("🟡 Event received - ticketId:", ticketId);

      const ticket = await step.run("fetch-ticket", async () => {
        console.log("📥 Fetching ticket from DB...");
        const ticketObject = await Ticket.findById(ticketId);
        if (!ticketObject) {
          throw new NonRetriableError("Ticket not found");
        }
        console.log("✅ Ticket fetched:", ticketObject.title);
        return ticketObject;
      });

      await step.run("update-ticket-status", async () => {
        console.log("🔧 Updating status to TODO...");
        await Ticket.findByIdAndUpdate(ticket._id, { status: "TODO" });
      });

      console.log("🤖 Running AI analysis...");
      const aiResponse = await analyzeTicket(ticket);
      console.log("✅ AI response:", aiResponse);

      const relatedskills = await step.run("ai-processing", async () => {
        console.log("🧠 Updating ticket with AI data...");
        let skills = [];
        if (aiResponse) {
          await Ticket.findByIdAndUpdate(ticket._id, {
            priority: !["low", "medium", "high"].includes(aiResponse.priority)
              ? "medium"
              : aiResponse.priority,
            helpfulNotes: aiResponse.helpfulNotes,
            status: "IN_PROGRESS",
            relatedSkills: aiResponse.relatedSkills,
          });
          skills = aiResponse.relatedSkills;
          console.log("✅ Updated ticket with priority, notes, and skills:", skills);
        }
        return skills;
      });

      const moderator = await step.run("assign-moderator", async () => {
        console.log("🎯 Finding moderator with skills:", relatedskills);
        let user = await User.findOne({
          role: "moderator",
          skills: {
            $elemMatch: {
              $regex: relatedskills.join("|"),
              $options: "i",
            },
          },
        });

        if (!user) {
          console.log("⚠️ No moderator found with matching skills. Falling back to admin...");
          user = await User.findOne({ role: "admin" });
        }

        await Ticket.findByIdAndUpdate(ticket._id, {
          assignedTo: user?._id || null,
        });

        console.log("✅ Assigned to:", user?.email || "No one (null)");
        return user;
      });

      await step.run("send-email-notification", async () => {
        if (moderator) {
          const finalTicket = await Ticket.findById(ticket._id);
          console.log("📧 Sending email to:", moderator.email);
          await sendMail(
            moderator.email,
            "Ticket Assigned",
            `A new ticket is assigned to you: ${finalTicket.title}`
          );
          console.log("✅ Email sent successfully.");
        } else {
          console.log("⚠️ No moderator to send email to.");
        }
      });

      console.log("🎉 All steps completed for ticket:", ticket._id);
      return { success: true };
    } catch (err) {
      console.error("❌ Error running the step", err.message);
      return { success: false };
    }
  }
);
