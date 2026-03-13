import express from "express";
import multer from "multer";
import path from "path";
import jwt from "jsonwebtoken";
import Banner from "../models/Banner.js";
import Order from "../models/Order.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

const parseDateBoundary = (value, boundary = "start") => {
  if (!value) return null;

  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    if (boundary === "end") {
      return new Date(year, month - 1, day, 23, 59, 59, 999);
    }
    return new Date(year, month - 1, day, 0, 0, 0, 0);
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
};

const getLocalDayStart = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
};

const getLocalDayEnd = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
};

const isBannerLiveNow = (banner, now = new Date()) => {
  const startAt = getLocalDayStart(banner.startAt);
  const endAt = getLocalDayEnd(banner.endAt);

  if (!banner.isActive) return false;
  if (startAt && startAt > now) return false;
  if (endAt && endAt < now) return false;
  return true;
};

const getOptionalUserId = (req) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded?.id || null;
  } catch {
    return null;
  }
};

router.post("/admin/banners", upload.single("desktop"), async (req, res) => {
  const banner = await Banner.create({
    title: req.body.title,
    link: req.body.link,
    targetType: req.body.targetType || "global",
    targetValue: String(req.body.targetValue || "").trim().toLowerCase(),
    audienceType: req.body.audienceType || "all",
    startAt: parseDateBoundary(req.body.startAt, "start"),
    endAt: parseDateBoundary(req.body.endAt, "end"),
    imageDesktop: req.file.filename,
    isActive: true,
  });

  res.json(banner);
});

router.get("/admin/banners", async (req, res) => {
  const banners = await Banner.find().sort({ createdAt: -1 });
  res.json(banners);
});

router.put("/admin/banners/:id/toggle", async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  banner.isActive = !banner.isActive;
  await banner.save();
  res.json(banner);
});

router.delete("/admin/banners/:id", async (req, res) => {
  await Banner.findByIdAndDelete(req.params.id);
  res.json({ message: "Banner deleted" });
});

router.get("/banners", async (req, res) => {
  const requestedCategory = String(req.query.category || "").trim().toLowerCase();
  const userId = getOptionalUserId(req);
  const orderCount = userId
    ? await Order.countDocuments({
        user: userId,
        orderStatus: { $ne: "cancelled" },
      })
    : 0;

  const targetFilter = requestedCategory
    ? {
        $or: [
          { targetType: "global" },
          { targetType: "category", targetValue: requestedCategory },
        ],
      }
    : {
        targetType: "global",
      };

  const audienceFilter =
    orderCount > 0
      ? { audienceType: "all" }
      : { audienceType: { $in: ["all", "before_first_order"] } };

  const banners = await Banner.find({
    isActive: true,
    ...targetFilter,
    ...audienceFilter,
  }).sort({ createdAt: -1 });

  res.json(banners.filter((banner) => isBannerLiveNow(banner)));
});

export default router;
