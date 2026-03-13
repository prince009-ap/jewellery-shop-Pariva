import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String },
    subtitle: { type: String },

    // 🔥 images
    imageDesktop: { type: String, required: true },
    imageMobile: { type: String },

    buttonText: { type: String },
    link: { type: String },
    targetType: {
      type: String,
      enum: ["global", "category"],
      default: "global",
    },
    targetValue: { type: String, default: "" },
    audienceType: {
      type: String,
      enum: ["all", "before_first_order"],
      default: "all",
    },
    startAt: { type: Date, default: null },
    endAt: { type: Date, default: null },

    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("Banner", bannerSchema);
