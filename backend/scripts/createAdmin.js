import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Admin from "../models/Admin.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const adminExists = await Admin.findOne({
      email: "senjaliyaprince009@gmail.com",
    });

    if (adminExists) {
      console.log("Admin already exists");
      process.exit();
    }

    const admin = await Admin.create({
      name: "PARIVA Admin",
      email: "senjaliyaprince009@gmail.com",
      password: "Prince@009",
      mobile: "9999999999",
    });

    console.log("Admin created successfully");
    console.log({
      email: admin.email,
      password: "Prince@009",
    });

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

createAdmin();
