import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import User from "../models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOne().lean();
  if (!user) {
    console.log("No users found in database.");
    process.exit(0);
  }
  console.log("User:", { email: user.email, password: user.password, startsWith2: user.password?.startsWith("$2") });
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
