import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatConversation",
      required: true,
      index: true,
    },
    roomId: {
      type: String,
      required: true,
      index: true,
    },
    text: {
      type: String,
      default: "",
      trim: true,
    },
    attachments: [
      {
        kind: {
          type: String,
          enum: ["image", "file"],
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        filename: {
          type: String,
          required: true,
        },
        originalName: {
          type: String,
          required: true,
        },
        mimeType: {
          type: String,
          required: true,
        },
        size: {
          type: Number,
          required: true,
        },
      },
    ],
    sender: {
      type: String,
      enum: ["user", "agent", "bot"],
      required: true,
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "seen"],
      default: "sent",
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    seenAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

chatMessageSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    ret.timestamp = ret.createdAt;
    ret.attachments = Array.isArray(ret.attachments) ? ret.attachments : [];
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.models.ChatMessage ||
  mongoose.model("ChatMessage", chatMessageSchema);
