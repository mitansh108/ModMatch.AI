import { createAgent, gemini } from "@inngest/agent-kit"

export const generateReplyFromNotes = async (notes) => {
  const agent = createAgent({
    model: gemini({
      model: "gemini-1.5-flash-8b",
      apiKey: process.env.GEMINI_API_KEY,
    }),
    name: "AI Reply Agent",
    system: `You are an AI assistant helping moderators respond to technical support tickets.

Given helpful notes written by a previous analysis step, generate a professional and helpful reply that can be sent directly to the user.

Rules:
- Be concise, friendly, and solution-focused.
- Do not mention you're an AI.
- Use plain English.
- Avoid speculative language. Stick to what is known from the notes.
- You must return only the reply text. No markdown, no code blocks, no explanations.`
  });

  const response = await agent.run(`Here are the helpful notes for a support ticket:\n\n"${notes}"\n\nNow generate a complete, friendly, and helpful reply to the user.`);

  return response.output[0].content.trim();
};
