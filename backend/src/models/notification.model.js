import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["message", "mention", "system"], default: "message" },
    messageId: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    title: { type: String },
    text: { type: String },
    isUrgent: { type: Boolean, default: false },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
