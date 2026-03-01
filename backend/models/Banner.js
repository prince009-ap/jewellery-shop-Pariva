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

    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("Banner", bannerSchema);
