import express from "express"
import { generateReplyFromNotes } from "../ai-models/generateReplyFromNotes.js"

const router = express.Router()

router.post("/generate-reply", async (req, res) => {
  const { notes } = req.body

  if (!notes) {
    return res.status(400).json({ error: "Missing notes" })
  }

  try {
    console.log("🧠 AI Reply: Received notes:", notes)
    const reply = await generateReplyFromNotes(notes)
    console.log("✅ AI Reply generated:", reply)
    res.status(200).json({ reply })
  } catch (err) {
    console.error("❌ AI reply generation failed:", err)
    res.status(500).json({ error: "Failed to generate reply" })
  }
})

export default router
