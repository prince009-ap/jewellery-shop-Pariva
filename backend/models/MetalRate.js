import mongoose from "mongoose";

const metalRateSchema = new mongoose.Schema(
  {
    goldRate: { type: Number, required: true },
    silverRate: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("MetalRate", metalRateSchema);
