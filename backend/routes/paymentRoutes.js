import express from "express";
const router = express.Router();
import protect from "../middleware/authMiddleware.js";
import { getRazorpayKey, createOrder, verifyPayment } from "../controllers/paymentController.js";

// GET Razorpay public key
router.get("/key", getRazorpayKey);

// Create new Razorpay order
router.post("/create-order", protect, createOrder);

// Verify payment
router.post("/verify", protect, verifyPayment);

export default router;
