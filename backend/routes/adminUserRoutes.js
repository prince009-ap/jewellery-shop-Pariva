import express from "express";
import { protectAdmin } from "../middleware/adminAuthMiddleware.js";
import {
  getAllUsers,
  toggleUserStatus,
} from "../controllers/adminUserController.js";

const router = express.Router();

router.get("/admin/users", protectAdmin, getAllUsers);
router.patch("/admin/users/:id/toggle", protectAdmin, toggleUserStatus);

export default router;
