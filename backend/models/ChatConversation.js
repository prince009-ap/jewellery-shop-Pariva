import mongoose from "mongoose";

const chatConversationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    roomId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    mode: {
      type: String,
      enum: ["bot", "waiting_agent", "agent"],
      default: "bot",
    },
    assignedAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    handoverRequested: {
      type: Boolean,
      default: false,
    },
    lastMessagePreview: {
      type: String,
      default: "",
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    lastSeen: {
      user: {
        type: Date,
        default: null,
      },
      agent: {
        type: Date,
        default: null,
      },
    },
  },
  { timestamps: true }
);

export default mongoose.models.ChatConversation ||
  mongoose.model("ChatConversation", chatConversationSchema);
