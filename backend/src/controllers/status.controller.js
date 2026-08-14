import Status from "../models/status.model.js";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

// Helper to get allowed isolated contact IDs for a given user
const getIsolatedUserIds = async (userId) => {
  const user = await User.findById(userId).select("contacts");
  const savedContactIds = user ? (user.contacts || []) : [];

  const invitedByUsers = await User.find({ contacts: userId }).select("_id");
  const invitedByIds = invitedByUsers.map((u) => u._id);

  const messages = await Message.find({
    $or: [
      { senderId: userId, receiverId: { $ne: null } },
      { receiverId: userId, senderId: { $ne: null } }
    ]
  }).select("senderId receiverId");

  const messageUserIds = [];
  messages.forEach((msg) => {
    if (msg.senderId && msg.senderId.toString() !== userId.toString()) messageUserIds.push(msg.senderId);
    if (msg.receiverId && msg.receiverId.toString() !== userId.toString()) messageUserIds.push(msg.receiverId);
  });

  return Array.from(
    new Set([
      userId.toString(),
      ...savedContactIds.map((id) => id.toString()),
      ...invitedByIds.map((id) => id.toString()),
      ...messageUserIds.map((id) => id.toString())
    ])
  );
};

// Fetch statuses of the current user and their isolated contacts
export const getStatuses = async (req, res) => {
  try {
    const userId = req.user._id;
    const allowedUserIds = await getIsolatedUserIds(userId);

    const activeStatuses = await Status.find({
      userId: { $in: allowedUserIds },
      expiresAt: { $gt: new Date() }
    }).populate("userId", "fullName profilePic").sort({ createdAt: -1 });

    res.status(200).json(activeStatuses);
  } catch (error) {
    console.error("Error in getStatuses controller:", error.stack);
    res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
};

export const createStatus = async (req, res) => {
  try {
    const { content, type } = req.body;
    const userId = req.user._id;

    if (!content) {
      return res.status(400).json({ error: "Status content is required" });
    }

    let finalContent = content;
    if (type === "image") {
      const uploadResponse = await cloudinary.uploader.upload(content);
      finalContent = uploadResponse.secure_url;
    }

    // Expire in 24 hours
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const newStatus = new Status({
      userId,
      content: finalContent,
      type: type || "text",
      expiresAt
    });

    await newStatus.save();

    const populatedStatus = await Status.findById(newStatus._id).populate("userId", "fullName profilePic");

    // Broadcast the new status ONLY to isolated contacts in real-time
    const allowedUserIds = await getIsolatedUserIds(userId);
    allowedUserIds.forEach((contactId) => {
      const socketId = getReceiverSocketId(contactId);
      if (socketId) {
        io.to(socketId).emit("newStatus", populatedStatus);
      }
    });

    res.status(201).json(populatedStatus);
  } catch (error) {
    console.error("Error in createStatus controller:", error.stack);
    res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
};
