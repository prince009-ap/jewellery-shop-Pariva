import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";
import User from "../models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const email = process.argv[2] || "prince@test.com";
const newPassword = process.argv[3] || "Test1234!";

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const hash = await bcrypt.hash(newPassword, 12);
  const res = await User.updateOne({ email: email.trim().toLowerCase() }, { password: hash });
  console.log(`Updated ${res.matchedCount} user(s). New password is '${newPassword}'.`);
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
