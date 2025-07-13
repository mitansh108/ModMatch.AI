import express from "express";
import { getUser, login, logout, signup, updateUser, getCurrentUser } from "../controllers/user.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router()

router.post("/update-user", authenticate, updateUser);
router.get("/users", authenticate, getUser);
router.get("/me", authenticate, getCurrentUser);
router.patch("/me", authenticate, updateUser);
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);


export default router;