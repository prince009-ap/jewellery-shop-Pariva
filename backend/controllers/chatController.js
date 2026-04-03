import ChatConversation from "../models/ChatConversation.js";
import {
  assignConversationToAgent,
  getOrCreateConversationForUser,
  listActiveConversations,
  listConversationMessages,
} from "../services/chatService.js";

function canAccessConversation(conversation, req) {
  if (req.admin) {
    return true;
  }

  return conversation.user.toString() === req.user?._id?.toString();
}

export async function getMyConversation(req, res, next) {
  try {
    const conversation = await getOrCreateConversationForUser(req.user._id);
    const messages = await listConversationMessages(conversation._id);

    res.json({
      conversation,
      messages,
    });
  } catch (error) {
    next(error);
  }
}

export async function getConversationMessages(req, res, next) {
  try {
    const conversation = await ChatConversation.findById(req.params.conversationId)
      .populate("user", "name email mobile")
      .populate("assignedAgent", "name email");

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    if (!canAccessConversation(conversation, req)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const messages = await listConversationMessages(conversation._id);
    res.json({ conversation, messages });
  } catch (error) {
    next(error);
  }
}

export async function getActiveConversations(req, res, next) {
  try {
    const conversations = await listActiveConversations();
    res.json(conversations);
  } catch (error) {
    next(error);
  }
}

export async function claimConversation(req, res, next) {
  try {
    const conversation = await assignConversationToAgent(
      req.params.conversationId,
      req.admin._id
    );

    res.json(conversation);
  } catch (error) {
    next(error);
  }
}
