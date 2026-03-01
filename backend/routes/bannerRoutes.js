import express from "express";
import Banner from "../models/Banner.js";
import multer from "multer";
import path from "path";

const router = express.Router();

/* ===== MULTER ===== */
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

/* ➕ ADD BANNER (ADMIN) */
router.post(
  "/admin/banners",
  upload.single("desktop"),
  async (req, res) => {
    const banner = await Banner.create({
      title: req.body.title,
      link: req.body.link,
      imageDesktop: req.file.filename,
      isActive: true,
    });
    res.json(banner);
  }
);

/* 📋 GET ALL BANNERS (ADMIN) */
router.get("/admin/banners", async (req, res) => {
  const banners = await Banner.find().sort({ createdAt: -1 });
  res.json(banners);
});

/* 🔁 TOGGLE STATUS */
router.put("/admin/banners/:id/toggle", async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  banner.isActive = !banner.isActive;
  await banner.save();
  res.json(banner);
});

/* 🗑 DELETE */
router.delete("/admin/banners/:id", async (req, res) => {
  await Banner.findByIdAndDelete(req.params.id);
  res.json({ message: "Banner deleted" });
});

/* 👤 GET ACTIVE BANNERS (USER) */
router.get("/banners", async (req, res) => {
  const banners = await Banner.find({ isActive: true }).sort({ createdAt: -1 });
  res.json(banners);
});

export default router;
