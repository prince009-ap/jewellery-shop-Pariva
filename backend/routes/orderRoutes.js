import express from "express";
import {
  placeCodOrder,
  getMyOrders,
  getAllOrders,
  cancelOrder,
  updateOrderStatus,
  deleteOrder,
  getInvoiceDownload,
  getOrderDetails,
  updateOrderStatusAdmin,
} from "../controllers/orderController.js";

import protect from "../middleware/authMiddleware.js";
import { protectAdmin } from "../middleware/adminAuthMiddleware.js";

const router = express.Router();

// User routes
router.get("/my", protect, getMyOrders);
router.get("/:orderId", protect, getOrderDetails);
router.get("/:orderId/invoice", protect, getInvoiceDownload);
router.post("/place-cod-order", protect, placeCodOrder);
router.post("/cod", protect, placeCodOrder); // ✅ Added /cod route
router.put("/:orderId/cancel", protect, cancelOrder);
router.delete("/:orderId", protect, deleteOrder);
// Admin routes
router.get("/admin/all", protectAdmin, getAllOrders);
router.get("/admin/:orderId", protectAdmin, getOrderDetails);
router.put("/admin/:orderId/status", protectAdmin, updateOrderStatusAdmin);
router.delete("/admin/:orderId", protectAdmin, deleteOrder);

export default router;
