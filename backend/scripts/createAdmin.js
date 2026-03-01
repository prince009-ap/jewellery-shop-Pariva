import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "../models/Admin.js";

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const adminExists = await Admin.findOne({
      email: "senjaliyaprince009@gmail.com",
    });

    if (adminExists) {
      console.log("❌ Admin already exists");
      process.exit();
    }

    const admin = await Admin.create({
      name: "PARIVA Admin",
      email: "senjaliyaprince009@gmail.com",
      password: "Prince@009", // 🔐 hash automatically hoga
    });

    console.log("✅ Admin created successfully");
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
