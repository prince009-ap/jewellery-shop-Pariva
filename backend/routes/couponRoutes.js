import express from "express";
import { protectAdmin } from "../middleware/adminAuthMiddleware.js";
import protect from "../middleware/authMiddleware.js";
import { applyCoupon, createCoupon, deleteCoupon, toggleCouponStatus } from "../controllers/couponController.js";
import Coupon from "../models/Coupon.js";
const router = express.Router();

router.post("/admin/coupons", protectAdmin, createCoupon);
router.post("/apply-coupon", protect, applyCoupon);
router.get("/admin/coupons", protectAdmin, async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json(coupons);
});


// Enable / Disable coupon
router.patch(
  "/admin/coupons/:id/toggle",
  protectAdmin,
  toggleCouponStatus
);

router.delete("/admin/coupons/:id", protectAdmin, deleteCoupon);

export default router;
