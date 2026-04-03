import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import Admin from "../models/Admin.js";
import User from "../models/User.js";
import ChatConversation from "../models/ChatConversation.js";
import {
  getOrCreateConversationForUser,
  handleIncomingMessage,
  listActiveConversations,
  markConversationDelivered,
  markConversationSeen,
} from "../services/chatService.js";

const onlineUsers = new Map();
const onlineAdmins = new Map();

async function resolveSocketActor(socket) {
  const { token, role } = socket.handshake.auth || {};

  if (!token) {
    throw new Error("Missing token");
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  if (role === "admin") {
    const admin = await Admin.findById(decoded.id).select("name email");
    if (!admin) throw new Error("Admin not found");
    return { role: "admin", admin };
  }

  const user = await User.findById(decoded.id).select("name email mobile");
  if (!user) throw new Error("User not found");
  return { role: "user", user };
}

function emitPresence(io) {
  io.emit("chat:presence", {
    agentOnline: onlineAdmins.size > 0,
    onlineAdmins: Array.from(onlineAdmins.keys()),
  });
}

async function emitConversationList(io) {
  const conversations = await listActiveConversations();
  io.to("admins").emit("chat:conversations", conversations);
}

export function createChatSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const actor = await resolveSocketActor(socket);
      socket.data.actor = actor;
      next();
    } catch (error) {
      next(error);
    }
  });

  io.on("connection", async (socket) => {
    const { role, user, admin } = socket.data.actor;

    if (role === "admin") {
      onlineAdmins.set(admin._id.toString(), {
        socketId: socket.id,
        lastSeen: new Date(),
      });
      socket.join("admins");
      await emitConversationList(io);
    } else {
      const conversation = await getOrCreateConversationForUser(user._id);
      onlineUsers.set(user._id.toString(), {
        socketId: socket.id,
        roomId: conversation.roomId,
        lastSeen: new Date(),
      });
      socket.join(conversation.roomId);
    }

    emitPresence(io);

    socket.on("chat:join", async ({ conversationId }) => {
      const conversation = await ChatConversation.findById(conversationId);
      if (!conversation) return;

      if (
        role === "user" &&
        conversation.user.toString() !== user._id.toString()
      ) {
        return;
      }

      socket.join(conversation.roomId);
      await markConversationDelivered(conversationId, role);
      await markConversationSeen(conversationId, role);
      io.to(conversation.roomId).emit("chat:status_sync", { conversationId });
    });

    socket.on("chat:send", async ({ conversationId, text, attachments = [] }, callback) => {
      try {
        const trimmedText = String(text || "").trim();
        if (!trimmedText && (!Array.isArray(attachments) || attachments.length === 0)) {
          callback?.({ ok: false, message: "Message text is required" });
          return;
        }

        const payload = await handleIncomingMessage({
          conversationId,
          sender: role === "admin" ? "agent" : "user",
          text: trimmedText,
          attachments,
          hasOnlineAgent: onlineAdmins.size > 0,
          user,
          admin,
        });

        const includesBotReply = (payload.messages || []).some(
          (message) => message.sender === "bot"
        );

        if (role === "admin") {
          const conversation = await ChatConversation.findById(conversationId);
          if (conversation && onlineUsers.has(conversation.user.toString())) {
            await markConversationDelivered(conversationId, "user");
          }
        } else {
          if (onlineAdmins.size > 0 || payload.mode !== "agent") {
            await markConversationDelivered(conversationId, "agent");
          }

          if (includesBotReply) {
            await markConversationDelivered(conversationId, "user");
            await markConversationSeen(conversationId, "user");
          }
        }

        io.to(payload.roomId).emit("chat:messages", payload);
        io.to("admins").emit("chat:messages", payload);
        io.to(payload.roomId).emit("chat:status_sync", { conversationId });
        await emitConversationList(io);
        callback?.({ ok: true, payload });
      } catch (error) {
        callback?.({
          ok: false,
          message: error.message || "Failed to send message",
        });
      }
    });

    socket.on("chat:typing", async ({ conversationId, isTyping }) => {
      const conversation = await ChatConversation.findById(conversationId);
      if (!conversation) return;

      io.to(conversation.roomId).emit("chat:typing", {
        conversationId,
        sender: role === "admin" ? "agent" : "user",
        isTyping: Boolean(isTyping),
      });
    });

    socket.on("chat:seen", async ({ conversationId }) => {
      const conversation = await ChatConversation.findById(conversationId);
      if (!conversation) return;

      await markConversationSeen(conversationId, role);
      io.to(conversation.roomId).emit("chat:status_sync", { conversationId });
      await emitConversationList(io);
    });

    socket.on("disconnect", () => {
      if (role === "admin") {
        onlineAdmins.delete(admin._id.toString());
      } else {
        onlineUsers.delete(user._id.toString());
      }

      emitPresence(io);
    });
  });

  return io;
}
