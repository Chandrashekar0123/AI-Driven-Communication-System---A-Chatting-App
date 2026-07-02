import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },
    text: {
      type: String,
    },
    image: {
      type: String,
    },
    audio: {
      type: String,
    },
    fileUrl: {
      type: String,
    },
    fileType: {
      type: String,
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    repliedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    edited: {
      type: Boolean,
      default: false,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    reactions: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        emoji: String,
      }
    ],
    expiresAt: {
      type: Date,
      default: null,
    }
  },
  { timestamps: true }
);

// Compound indexes for optimized querying
messageSchema.index({ senderId: 1, receiverId: 1, createdAt: 1 });
messageSchema.index({ receiverId: 1, senderId: 1, createdAt: 1 });
messageSchema.index({ groupId: 1, createdAt: 1 });
// TTL index for disappearing messages
messageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Message = mongoose.model("Message", messageSchema);

export default Message;
