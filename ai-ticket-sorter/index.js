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
        origin: ["https://modmatch.vercel.app", "http://localhost:3000", "https://mod-match-ai.vercel.app"], // ✅ Vercel frontend domain
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
        app.listen(PORT, () => console.log(" Server at http://localhost:3000"));

    })
    .catch((err) => console.error("MongoDB error: ", err))