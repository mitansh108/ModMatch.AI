import Comment from "../ai-models/comment.js"
import Ticket from "../ai-models/ticket.js"

export const addComment = async (req, res) => {
  try {
    const ticketId = req.params.id
    const { message } = req.body
    const userId = req.user._id

    const ticket = await Ticket.findById(ticketId)
    if (!ticket) return res.status(404).json({ message: "Ticket not found" })

    const comment = new Comment({
      ticket: ticketId,
      user: userId,
      message,
    })

    await comment.save()

    return res.status(201).json({ message: "Comment added", comment })
  } catch (err) {
    console.error("Error adding comment:", err.message)
    return res.status(500).json({ message: "Server error" })
  }
}

export const getTicketComments = async (req, res) => {
  try {
    const ticketId = req.params.id

    const comments = await Comment.find({ ticket: ticketId })
      .populate("user", "email role")
      .sort({ createdAt: 1 })

    return res.status(200).json(comments)
  } catch (err) {
    console.error("Error fetching comments:", err.message)
    return res.status(500).json({ message: "Server error" })
  }
}
