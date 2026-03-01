import express from "express";
import {
  createWishlist,
  getWishlists,
    addToWishlist,
    removeFromWishlist,
    deleteWishlist,
    
} from "../controllers/wishlistController.js";
import  protect  from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createWishlist);
router.post("/add", protect, addToWishlist);
router.post("/remove", protect, removeFromWishlist);
router.delete("/:id", protect, deleteWishlist);
router.get("/", protect, getWishlists);


export default router;
