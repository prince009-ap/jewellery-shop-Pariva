import express from "express";
import { protectAdmin } from "../middleware/adminAuthMiddleware.js";
import { createCoupon, applyCoupon } from "../controllers/couponController.js";
import Coupon from "../models/Coupon.js";
import { toggleCouponStatus } from "../controllers/couponController.js";
const router = express.Router();

router.post("/admin/coupons", protectAdmin, createCoupon);
router.post("/apply-coupon", applyCoupon);
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

export default router;
