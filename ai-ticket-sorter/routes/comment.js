import express from "express"
import { authenticate } from "../middlewares/auth.js"
import { addComment, getTicketComments } from "../controllers/comment.js"

const router = express.Router()

// POST /api/tickets/:id/comment — Add a comment to a ticket
router.post("/:id/comment", authenticate, addComment)

// GET /api/tickets/:id/comments — Get all comments for a ticket
router.get("/:id/comments", authenticate, getTicketComments)

export default router
