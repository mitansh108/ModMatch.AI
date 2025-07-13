import {createAgent, gemini} from "@inngest/agent-kit"

const analyseTicket = async(ticket) =>{
    const supportAgent = createAgent ({
        model: gemini({
            model: "gemini-1.5-flash-8b",
            apiKey: process.env.GEMINI_API_KEY,
        }),

        name:" AI Ticket Sorting Agent",
        system: `You are an AI assistant that processes technical support tickets. Your task is to analyze each ticket and return a structured response as a raw JSON object with the following fields:

        "summary" – A brief, clear summary of the issue in plain English.
        "priority" – One of "low", "medium", or "high" based on the urgency and severity of the issue.
        "notes" – A helpful note for the human moderator, possibly including troubleshooting suggestions or context.
        "resources" – An array of helpful documentation URLs, links, or references (can be empty if none are relevant).
        "required_skills" – An array of technical skills (e.g., ["MongoDB", "Node.js"]) that a moderator should have to resolve the issue.
        ⚠️ Strict Output Rules:
You must respond with only a valid raw JSON object.
Do not include:
Markdown
Code blocks or fences
Comments
Extra text or labels
Headings or explanations
The output must be a pure JSON object, nothing else.
Your response must look exactly like this (structure only, not literal content):
{
    "summary": "...",
    "priority": "medium",
    "notes": "...",
    "resources": ["..."],
    "required_skills": ["..."]
  }
  Do not wrap it in any markdown or explanation.`
    });
  const response = await supportAgent.run(`You are a ticket triage agent. Only return a strict JSON object with no extra text, headers, or markdown.
        
  Analyze the following support ticket and provide a JSON object with:
  
  - summary: A short 1-2 sentence summary of the issue.
  - priority: One of "low", "medium", or "high".
  - helpfulNotes: A detailed technical explanation that a moderator can use to solve this issue. Include useful external links or resources if possible.
  - relatedSkills: An array of relevant skills required to solve the issue (e.g., ["React", "MongoDB"]).
  
  Respond ONLY in this JSON format and do not include any other text or markdown in the answer:
  
  {
  "summary": "Short summary of the ticket",
  "priority": "high",
  "helpfulNotes": "Here are useful tips...",
  "relatedSkills": ["React", "Node.js"]
  }
  
  ---
  
  Ticket information:
  
  - Title: ${ticket.title}
  - Description: ${ticket.description}`);

  const raw = response.output[0].content
  try {
    const match = raw.match(/```json\s*([\s\S]*?)\s*```/i);
    const jsonString = match ? match[1] : raw.trim();
    return JSON.parse(jsonString)
  } catch (error) {
    console.log("Failed to parse JSON from AI response " + error.message);
    return null;
  }
};
export default analyseTicket;