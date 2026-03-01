import express from "express";
import Banner from "../models/Banner.js";
import { protectAdmin } from "../middleware/adminAuthMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

/* ADD */
router.post(
  "/admin/banners",
  protectAdmin,
  upload.single("image"),
  async (req, res) => {
    const banner = await Banner.create({
      ...req.body,
      image: req.file.filename,
    });
    res.json(banner);
  }
);

/* LIST */
router.get("/banners", async (req, res) => {
  const banners = await Banner.find({ isActive: true });
  res.json(banners);
});

/* DELETE */
router.delete("/admin/banners/:id", protectAdmin, async (req, res) => {
  await Banner.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

export default router;
