import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    label: {
      type: String,
      enum: ["Home", "Work", "Hotel", "Other"],
      default: "Home",
    },

name: {
  type: String,
  required: true,
},
    house: { type: String, required: true },
    floor: String,
    area: { type: String, required: true },
    landmark: String,

    city: { type: String, required: true },
    state: { type: String, required: true },   // ✅ ADD THIS
    pincode: { type: String, required: true },

    phone: { type: String, required: true },  // ✅ ADD THIS

    lat: Number,
    lng: Number,
  },
  { timestamps: true }
);

export default mongoose.model("Address", addressSchema);