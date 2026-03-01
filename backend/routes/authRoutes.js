import express from "express";
import { register, login ,forgotPassword,resetPassword } from "../controllers/authController.js";
import protect  from "../middleware/authMiddleware.js";
import { getMe, updateProfile, changePassword } from "../controllers/authController.js";
import { logoutUser } from "../controllers/authController.js";
import { loginWithPasswordAndOtp } from "../controllers/authController.js";
import { verifyLoginOtp } from "../controllers/authController.js";
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/me", protect, getMe);
router.put("/update-profile", protect, updateProfile);
router.post("/logout", protect, logoutUser);
router.post("/login-password-otp", loginWithPasswordAndOtp);
router.post("/verify-login-otp", verifyLoginOtp);

export default router;
