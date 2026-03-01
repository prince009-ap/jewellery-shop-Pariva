import mongoose from "mongoose";

const customDesignSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  jewelleryType: String,
  metalType: String,
  purity: String,
  size: String,
  approxWeight: Number,
  weightEstimate: String,
  description: String,
  referenceImage: String,
stones: [String],
        size: String,
        budgetMin: Number,
        budgetMax: Number,
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },

  finalWeight: Number,
  makingCharge: Number,
  finalPrice: Number,

  rejectReason: String
}, { timestamps: true });

export default mongoose.model("CustomDesign", customDesignSchema);
