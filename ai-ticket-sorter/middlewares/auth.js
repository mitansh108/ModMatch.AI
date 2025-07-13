import jwt from "jsonwebtoken"
import User from "../ai-models/user.js"

export const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]

  if (!token) {
    return res.status(401).json({ error: "Access Denied. No token found." })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    console.log("Decoded JWT:", decoded) // 🔍 check if it's `id` or `_id`

    const userId = decoded.id || decoded._id
    if (!userId) {
      return res.status(401).json({ error: "Token missing user ID." })
    }

    const user = await User.findById(userId).select("-password")
    if (!user) {
      return res.status(401).json({ error: "User not found" })
    }

    req.user = user
    next()
  } catch (error) {
    console.error("Auth error:", error.message)
    res.status(401).json({ error: "Invalid token" })
  }
}
