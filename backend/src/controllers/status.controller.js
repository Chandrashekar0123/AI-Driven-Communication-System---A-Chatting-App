import Status from "../models/status.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

// Fetch statuses of the current user and their contacts
export const getStatuses = async (req, res) => {
  try {
    const userId = req.user._id;

    // In this app, users can see statuses of everyone they have messaged or is online
    // To simplify, we'll return all active statuses in the DB for now, grouped by user
    // A better approach would be to only return statuses of contacts.

    const activeStatuses = await Status.find({
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

    // Broadcast the new status to all users in real-time
    io.emit("newStatus", populatedStatus);

    res.status(201).json(populatedStatus);
  } catch (error) {
    console.error("Error in createStatus controller:", error.stack);
    res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
};
