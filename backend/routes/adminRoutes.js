import express from "express";
import { adminAuth } from "../middleware/adminAuth.js";

const router = express.Router();

// 🔑 GET logged-in admin
router.get("/me", adminAuth, async (req, res) => {
  res.json(req.admin);
});

export default router;
