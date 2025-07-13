import express from "express";
import { authenticate } from "../middlewares/auth.js";
import { createTicket, getTicket, getTickets, deleteTicket,updateTicket } from "../controllers/ticket.js";

const router = express.Router();



router.get("/", authenticate, getTickets)
router.get("/:id", authenticate, getTicket)
router.post("/", authenticate, createTicket)
router.delete("/:id", authenticate, deleteTicket);
router.patch("/:id", authenticate, updateTicket); 


export default router