import Coupon from "../models/Coupon.js";

export const createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json(coupon);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const applyCoupon = async (req, res) => {
  const { code, cartTotal } = req.body;

  const coupon = await Coupon.findOne({ code, isActive: true });

  if (!coupon) return res.status(400).json({ message: "Invalid coupon" });
  if (new Date() > coupon.expiryDate)
    return res.status(400).json({ message: "Coupon expired" });
  if (cartTotal < coupon.minOrderValue)
    return res.status(400).json({ message: "Minimum order not met" });

  let discount =
    coupon.discountType === "flat"
      ? coupon.discountValue
      : (cartTotal * coupon.discountValue) / 100;

  res.json({
    discount,
    finalAmount: cartTotal - discount,
  });
};
export const toggleCouponStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    res.json({
      message: `Coupon ${coupon.isActive ? "enabled" : "disabled"} successfully`,
      isActive: coupon.isActive,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
