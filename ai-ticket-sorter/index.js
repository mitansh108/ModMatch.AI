import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import {serve} from "inngest/express"
import userRoutes from "./routes/user.js"
import ticketRoutes from "./routes/ticket.js"
import { inngest } from "./inngest/client.js"
import { onUserSignup } from "./inngest/functions/on-signup.js"
import dotenv from "dotenv";
dotenv.config();

import { onTicketCreated } from "./inngest/functions/on-ticket.js"
const PORT = process.env.PORT || 3000
const app = express()
app.use(
    cors({
      origin: [
        "https://modmatch-ai.onrender.com",     // optional if needed
        "https://mod-match-ai.vercel.app",      // ✅ main frontend
        "http://localhost:3001",                // for local testing
      ],
      methods: ["GET", "POST", "PATCH", "DELETE"],
      credentials: true,
    })
  );



app.use(express.json())

app.use("/api/auth", userRoutes);

app.use("/api/auth", userRoutes);
app.use("/api/tickets", ticketRoutes);


app.use(

    "/api/inngest",
    serve({
        client: inngest,
        functions: [onUserSignup, onTicketCreated]
    })

);

mongoose
    .connect(process.env.MONGO_URI)
    .then(() =>{
        console.log("MongoDB connected");
        app.listen(PORT, () => console.log(" Server"));

    })
    .catch((err) => console.error("MongoDB error: ", err))