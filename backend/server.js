import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

// Log environment variables at startup
console.log("🔧 Environment Variables Status:");
console.log({
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI ? "SET" : "MISSING",
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID ? "SET" : "MISSING",
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET ? "SET" : "MISSING",
  JWT_SECRET: process.env.JWT_SECRET ? "SET" : "MISSING"
});

const app = express();

/* ================================
   GLOBAL MIDDLEWARES
================================ */

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ================================
   ROUTES IMPORT
================================ */

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

/* ================================
   ROUTES
================================ */

// Auth
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminAuthRoutes);

// Products
app.use("/api/products", productRoutes);
app.use("/api/admin/products", adminProductRoutes);

// Dashboard
app.use("/api/admin/dashboard", adminDashboardRoutes);

// Cart
app.use("/api/cart", cartRoutes);

// Address
app.use("/api/address", addressRoutes);

// Wishlist
app.use("/api/wishlist", wishlistRoutes);

// Orders
app.use("/api/orders", orderRoutes);

// Payment
app.use("/api/payment", paymentRoutes);

// Reviews
app.use("/api/reviews", reviewRoutes);

// Upload
app.use("/api/upload", uploadRoutes);

// Other APIs
app.use("/api", bannerRoutes);
app.use("/api", customDesignRoutes);
app.use("/api", metalRateRoutes);
app.use("/api", couponRoutes);
app.use("/api", adminUserRoutes);

/* ================================
   ROOT TEST ROUTE
================================ */

app.get("/", (req, res) => {
  res.send("API running...");
});

/* ================================
   GLOBAL ERROR HANDLER
================================ */

app.use((err, req, res, next) => {
  console.error("❌ SERVER ERROR:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

/* ================================
   DB CONNECTION + SERVER START
================================ */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    console.log("🔐 Razorpay Key:", process.env.RAZORPAY_KEY_ID ? "Loaded" : "Missing");

    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Failed:", err);
  });