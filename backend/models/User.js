import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  dob: { type: Date, required: true },
  gender: { type: String, enum: ["male", "female", "other"], required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
   resetToken: String,
  resetTokenExpire: Date,
  isBlocked: {
  type: Boolean,
  default: false,
},
mobile: {
  type: String,
  required: true,   // 👈 old users ke liye safe
},
loginOtp: String,
otpExpire: Date,

}, { timestamps: true });

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

export default mongoose.model("User", userSchema);
