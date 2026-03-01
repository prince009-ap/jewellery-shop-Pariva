import express from "express";
import {
  createReview,
  getProductReviews,
  deleteReview,
  getAllReviews,
  getReviewsByOrder
} from "../controllers/reviewController.js";

// 🔐 JWT Authentication Middleware
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// 📝 CREATE REVIEW - Protected route
router.post("/", protect, createReview);

// 📖 GET REVIEWS FOR A PRODUCT - Public route
router.get("/product/:productId", getProductReviews);

// 📋 GET REVIEWS BY ORDER - Protected route
router.get("/order/:orderId", protect, getReviewsByOrder);

// 🗑️ DELETE REVIEW - Protected route (only review owner)
router.delete("/:id", protect, deleteReview);

// 👑 ADMIN: GET ALL REVIEWS - Protected admin route
// Note: Add admin middleware if you have separate admin auth
router.get("/admin/all", getAllReviews);

export default router;
