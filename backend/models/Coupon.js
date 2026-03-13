import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  code: { type: String, unique: true, required: true },
  discountType: { type: String, enum: ["flat", "percent"], required: true },
  discountValue: { type: Number, required: true },
  minOrderValue: { type: Number, default: 0 },
  expiryDate: {
    type: Date,
    required: function () {
      return !this.firstOrderOnly;
    },
  },
  firstOrderOnly: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model("Coupon", couponSchema);
