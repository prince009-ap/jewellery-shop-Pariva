import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import { createChatSocket } from "./socket/chatSocket.js";

import authRoutes from "./routes/authRoutes.js";
import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import adminProductRoutes from "./routes/adminProductRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import adminDashboardRoutes from "./routes/adminDashboardRoutes.js";
import bannerRoutes from "./routes/bannerRoutes.js";
import customDesignRoutes from "./routes/customDesignRoutes.js";
import metalRateRoutes from "./routes/metalRateRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import adminUserRoutes from "./routes/adminUserRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const server = http.createServer(app);
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

console.log("Environment Variables Status:");
console.log({
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI ? "SET" : "MISSING",
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID ? "SET" : "MISSING",
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET ? "SET" : "MISSING",
  JWT_SECRET: process.env.JWT_SECRET ? "SET" : "MISSING",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY ? "SET" : "MISSING",
});

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminAuthRoutes);
app.use("/api/products", productRoutes);
app.use("/api/admin/products", adminProductRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api", bannerRoutes);
app.use("/api", customDesignRoutes);
app.use("/api", metalRateRoutes);
app.use("/api", couponRoutes);
app.use("/api", adminUserRoutes);

app.get("/", (_req, res) => {
  res.send("API running...");
});

app.use((err, _req, res, _next) => {
  console.error("SERVER ERROR:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    createChatSocket(server);

    server.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB Connection Failed:", err);
  });
