import express from "express";
import { getAdminDashboardStats } from "../controllers/adminDashboardController.js";
import { protectAdmin } from "../middleware/adminAuthMiddleware.js";
import { getGrowthAnalytics } from "../controllers/adminDashboardController.js";



const router = express.Router();

router.get("/stats", protectAdmin, getAdminDashboardStats);
router.get("/analytics", protectAdmin, getGrowthAnalytics);
export default router;
