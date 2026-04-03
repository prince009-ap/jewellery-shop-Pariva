import ChatConversation from "../models/ChatConversation.js";
import ChatMessage from "../models/ChatMessage.js";
import {
  generateAIChatResponse,
  HANDOVER_MESSAGE,
  OFFLINE_SUPPORT_MESSAGE,
} from "./chatAIService.js";

const GREETING_MESSAGE = "Hi! Welcome to Pariva Jewellery. How can I help you?";

function trimPreview(text, attachments = []) {
  const cleaned = String(text || "").replace(/\s+/g, " ").trim();
  if (cleaned) {
    return cleaned.slice(0, 120);
  }

  if (attachments.length) {
    const first = attachments[0];
    return first.kind === "image"
      ? `Shared image: ${first.originalName}`
      : `Shared file: ${first.originalName}`;
  }

  return "";
}

function buildRoomId(userId) {
  return `chat_user_${userId}`;
}

async function updateConversationSnapshot(conversationId, text, attachments = []) {
  await ChatConversation.findByIdAndUpdate(
    conversationId,
    {
      lastMessagePreview: trimPreview(text, attachments),
      lastMessageAt: new Date(),
    },
    {}
  );
}

export async function getOrCreateConversationForUser(userId) {
  let conversation = await ChatConversation.findOne({ user: userId })
    .populate("user", "name email")
    .populate("assignedAgent", "name email");

  if (conversation) {
    return conversation;
  }

  const roomId = buildRoomId(userId);
  conversation = await ChatConversation.create({
    user: userId,
    roomId,
    mode: "bot",
    lastSeen: { user: new Date(), agent: null },
  });

  await ChatMessage.create({
    conversation: conversation._id,
    roomId,
    text: GREETING_MESSAGE,
    sender: "bot",
    status: "delivered",
    deliveredAt: new Date(),
  });

  await ChatConversation.findByIdAndUpdate(conversation._id, {
    lastMessagePreview: GREETING_MESSAGE,
    lastMessageAt: new Date(),
  });

  return ChatConversation.findById(conversation._id)
    .populate("user", "name email")
    .populate("assignedAgent", "name email");
}

export async function listConversationMessages(conversationId) {
  return ChatMessage.find({ conversation: conversationId }).sort({ createdAt: 1 });
}

export async function listActiveConversations() {
  return ChatConversation.find()
    .populate("user", "name email mobile")
    .populate("assignedAgent", "name email")
    .sort({ lastMessageAt: -1 });
}

export async function assignConversationToAgent(conversationId, adminId) {
  const conversation = await ChatConversation.findById(conversationId);

  if (!conversation) {
    const error = new Error("Conversation not found");
    error.status = 404;
    throw error;
  }

  if (
    conversation.assignedAgent &&
    conversation.assignedAgent.toString() !== adminId.toString()
  ) {
    const error = new Error("This chat is already assigned to another agent");
    error.status = 409;
    throw error;
  }

  conversation.assignedAgent = adminId;
  conversation.handoverRequested = false;
  conversation.mode = "agent";
  await conversation.save();

  return ChatConversation.findById(conversationId)
    .populate("user", "name email mobile")
    .populate("assignedAgent", "name email");
}

export async function markConversationSeen(conversationId, actor) {
  const conversation = await ChatConversation.findById(conversationId);

  if (!conversation) {
    return null;
  }

  const oppositeSenders = actor === "user" ? ["agent", "bot"] : ["user"];
  const seenAt = new Date();

  await ChatMessage.updateMany(
    {
      conversation: conversationId,
      sender: { $in: oppositeSenders },
      status: { $ne: "seen" },
    },
    {
      $set: {
        status: "seen",
        seenAt,
        deliveredAt: seenAt,
      },
    }
  );

  await ChatConversation.findByIdAndUpdate(conversationId, {
    [`lastSeen.${actor}`]: seenAt,
  });

  return ChatConversation.findById(conversationId);
}

export async function markConversationDelivered(conversationId, actor) {
  const conversation = await ChatConversation.findById(conversationId);

  if (!conversation) {
    return null;
  }

  const oppositeSenders = actor === "user" ? ["agent", "bot"] : ["user"];
  const deliveredAt = new Date();

  await ChatMessage.updateMany(
    {
      conversation: conversationId,
      sender: { $in: oppositeSenders },
      status: "sent",
    },
    {
      $set: {
        status: "delivered",
        deliveredAt,
      },
    }
  );

  return ChatConversation.findById(conversationId);
}

async function createMessage({ conversation, text, sender, attachments = [] }) {
  const message = await ChatMessage.create({
    conversation: conversation._id,
    roomId: conversation.roomId,
    text,
    attachments,
    sender,
    status: "sent",
  });

  await updateConversationSnapshot(conversation._id, text, attachments);
  return message;
}

export async function handleIncomingMessage({
  conversationId,
  sender,
  text,
  attachments = [],
  hasOnlineAgent = false,
  user,
  admin,
}) {
  const conversation = await ChatConversation.findById(conversationId);

  if (!conversation) {
    const error = new Error("Conversation not found");
    error.status = 404;
    throw error;
  }

  const normalizedText = String(text || "").trim();
  const normalizedAttachments = Array.isArray(attachments) ? attachments : [];

  if (!normalizedText && normalizedAttachments.length === 0) {
    const error = new Error("Message text or attachment is required");
    error.status = 400;
    throw error;
  }

  if (sender === "agent") {
    if (
      conversation.assignedAgent &&
      conversation.assignedAgent.toString() !== admin._id.toString()
    ) {
      const error = new Error("This chat is assigned to another agent");
      error.status = 409;
      throw error;
    }

    conversation.assignedAgent = admin._id;
    conversation.mode = "agent";
    conversation.handoverRequested = false;
    await conversation.save();

    const agentMessage = await createMessage({
      conversation,
      text: normalizedText,
      sender: "agent",
      attachments: normalizedAttachments,
    });

    return {
      conversationId: conversation._id.toString(),
      roomId: conversation.roomId,
      messages: [agentMessage.toJSON()],
      mode: conversation.mode,
    };
  }

  const userMessage = await createMessage({
    conversation,
    text: normalizedText,
    sender: "user",
    attachments: normalizedAttachments,
  });

  const messages = [userMessage.toJSON()];

  if (!hasOnlineAgent) {
    conversation.mode = "waiting_agent";
    conversation.handoverRequested = true;

    const botMessage = await createMessage({
      conversation,
      text: OFFLINE_SUPPORT_MESSAGE,
      sender: "bot",
    });

    await conversation.save();

    messages.push(botMessage.toJSON());

    return {
      conversationId: conversation._id.toString(),
      roomId: conversation.roomId,
      messages,
      mode: conversation.mode,
      handoverRequested: conversation.handoverRequested,
    };
  }

  if (conversation.mode === "bot") {
    const aiPrompt =
      normalizedText ||
      (normalizedAttachments[0]?.kind === "image"
        ? "Customer shared an image and may need help with it."
        : "Customer shared a file and may need help with it.");
    const aiResult = await generateAIChatResponse({ message: aiPrompt, user });

    if (aiResult.handover) {
      conversation.mode = "waiting_agent";
      conversation.handoverRequested = true;
    }

    const botMessage = await createMessage({
      conversation,
      text: aiResult.reply || HANDOVER_MESSAGE,
      sender: "bot",
    });

    messages.push(botMessage.toJSON());
  }

  await conversation.save();

  return {
    conversationId: conversation._id.toString(),
    roomId: conversation.roomId,
    messages,
    mode: conversation.mode,
    handoverRequested: conversation.handoverRequested,
  };
}

export { GREETING_MESSAGE };
