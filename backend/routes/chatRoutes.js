import express from "express";
import protect from "../middleware/authMiddleware.js";
import { protectAdmin } from "../middleware/adminAuthMiddleware.js";
import {
  claimConversation,
  getActiveConversations,
  getConversationMessages,
  getMyConversation,
} from "../controllers/chatController.js";
import { uploadChatAttachment } from "../controllers/chatUploadController.js";
import chatAuthMiddleware from "../middleware/chatAuthMiddleware.js";
import chatUpload from "../middleware/chatUploadMiddleware.js";

const router = express.Router();

router.get("/me", protect, getMyConversation);
router.get("/conversation/:conversationId", protect, getConversationMessages);
router.post("/upload", chatAuthMiddleware, chatUpload.single("file"), uploadChatAttachment);

router.get("/admin/conversations", protectAdmin, getActiveConversations);
router.get("/admin/conversation/:conversationId", protectAdmin, getConversationMessages);
router.post("/admin/conversation/:conversationId/claim", protectAdmin, claimConversation);

export default router;
