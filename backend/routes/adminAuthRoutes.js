import express from "express";
import adminProtect from "../middleware/adminProtect.js";
import {
  adminLoginWithOtp,
  verifyAdminOtp,
} from "../controllers/adminAuthController.js";

const router = express.Router();

router.post("/login", adminLoginWithOtp);
router.post("/verify-otp", verifyAdminOtp);

router.get("/me", adminProtect, (req, res) => {
  res.json(req.admin);
});

export default router;
