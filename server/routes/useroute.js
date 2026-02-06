import express from "express";
import { register, login, getProfile } from "../controllers/usercontroller.js";
import authenticateToken from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.get("/profile", authenticateToken, getProfile);

// Health check
router.get("/", (req, res) => {
  res.json({ message: "🚀 AI Form Builder API is running!" });
});

export default router;