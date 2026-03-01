import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import protect  from "../middleware/authMiddleware.js";
import {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getProductById,
  getProductsByFilter,
} from "../controllers/productController.js";

const router = express.Router();

// 🔓 PUBLIC: get all products
router.get("/", getProducts);

// 🔓 PUBLIC: get products by category
router.get("/category/:category", getProductsByCategory);

// 🔓 PUBLIC: get product by ID
router.get("/:id", getProductById);

// 🔓 PUBLIC: get products with filters
router.get("/filter", getProductsByFilter);

// 🔐 ADMIN ONLY: create product
router.post(
  "/",
  protect,
  upload.single("image"),
  createProduct
);

// 🔐 ADMIN ONLY: update product
router.put(
  "/:id",
  protect,
  upload.single("image"),
  updateProduct
);

// 🔐 ADMIN ONLY: delete product
router.delete(
  "/:id",
  protect,
  deleteProduct
);

export default router;
