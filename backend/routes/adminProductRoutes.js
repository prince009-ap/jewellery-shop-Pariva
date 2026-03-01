import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { protectAdmin } from "../middleware/adminAuthMiddleware.js";
import {
  createProduct,
  getProducts as getAdminProducts,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

const router = express.Router();

router.post("/", protectAdmin, upload.single("image"), createProduct);
router.get("/", protectAdmin, getAdminProducts);
router.put("/:id", protectAdmin, upload.single("image"), updateProduct);
router.delete("/:id", protectAdmin, deleteProduct);

export default router;
  
