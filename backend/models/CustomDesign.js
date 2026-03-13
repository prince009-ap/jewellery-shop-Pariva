import mongoose from "mongoose";

const customDesignSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  jewelleryType: String,
  purpose: String,
  budgetTier: {
    label: String,
    min: Number,
    max: Number,
    category: String,
  },
  metalType: String,
  purity: String,
  size: String,
  ringSize: Number,
  necklaceLength: String,
  bangleSize: String,
  approxWeight: Number,
  weightEstimate: String,
  finish: String,
  occasion: String,
  description: String,
  referenceImage: String,
  stone: String,
  stones: [String],
  budgetMin: Number,
  budgetMax: Number,
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },

  finalWeight: Number,
  goldRate: Number,
  makingCharge: Number,
  stoneCharge: { type: Number, default: 0 },
  gstAmount: { type: Number, default: 0 },
  finalPrice: Number,
  deliveryDays: Number,
  adminNote: String,

  rejectReason: String,
  rejectionSuggestion: {
    jewelleryType: String,
    metalType: String,
    approxPrice: Number,
    note: String
  }
}, { timestamps: true });

export default mongoose.model("CustomDesign", customDesignSchema);
