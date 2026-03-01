import express from "express";
import { protectAdmin } from "../middleware/adminAuthMiddleware.js";
import { updateMetalRates } from "../controllers/metalRateController.js";

const router = express.Router();

router.post("/admin/metal-rates", protectAdmin, updateMetalRates);

export default router;
