import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import Group from "../models/group.model.js";
import { getAIResponse, generateAIRecommendations, generateAISummary } from "../lib/gemini.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const searchUser = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: "Search query is required" });

    const user = await User.findOne({
      $or: [{ email: query.toLowerCase() }, { phoneNumber: query }],
    }).select("-password");

    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const user = await User.findById(loggedInUserId).populate("contacts", "-password");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json(user.contacts || []);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const addContact = async (req, res) => {
  try {
    const { contactId } = req.body; // username or phoneNumber
    const myId = req.user._id;

    if (!contactId) return res.status(400).json({ error: "Username or Phone Number is required" });

    const contactUser = await User.findOne({
      $or: [
        { email: contactId.toLowerCase() },
        { phoneNumber: contactId }
      ],
    });

    if (!contactUser) return res.status(404).json({ error: "User not found" });

    if (contactUser._id.toString() === myId.toString()) {
      return res.status(400).json({ error: "You cannot add yourself" });
    }

    const user = await User.findById(myId);
    if (user.contacts.includes(contactUser._id)) {
      return res.status(400).json({ error: "Contact already added" });
    }

    user.contacts.push(contactUser._id);
    await user.save();

    res.status(200).json({ message: "Contact added successfully", contact: contactUser });
  } catch (error) {
    console.error("Error in addContact: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: chatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: chatId },
        { senderId: chatId, receiverId: myId },
        { groupId: chatId },
      ],
    }).sort({ createdAt: 1 }).lean();

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image, file, fileType, groupId, repliedTo } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (!text && !image && !file) {
      return res.status(400).json({ error: "Message content is required" });
    }

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image, { folder: "chat_app/messages" });
      imageUrl = uploadResponse.secure_url;
    }

    let fileUrl;
    if (file) {
      const uploadResponse = await cloudinary.uploader.upload(file, { folder: "chat_app/files", resource_type: "auto" });
      fileUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId: groupId ? null : receiverId,
      groupId: groupId || null,
      text,
      image: imageUrl,
      fileUrl,
      fileType,
      repliedTo,
    });

    await newMessage.save();
    
    // Populate sender info for the socket payload
    const populatedMessage = await Message.findById(newMessage._id).populate("senderId", "fullName profilePic");
    const socketPayload = populatedMessage.toObject();

    if (groupId) {
      const group = await Group.findById(groupId).lean();
      if (group) {
        console.log(`DEBUG: Emitting message to group ${groupId}`);
        group.members.forEach((memberId) => {
          if (memberId.toString() !== senderId.toString()) {
            const receiverSocketId = getReceiverSocketId(memberId);
            if (receiverSocketId) io.to(receiverSocketId).emit("newMessage", socketPayload);
          }
        });
      }
    } else {
      const receiverIdStr = receiverId.toString();
      const receiverSocketId = getReceiverSocketId(receiverIdStr);
      console.log(`DEBUG: Emitting message to user ${receiverIdStr} (Socket: ${receiverSocketId || "NOT FOUND"})`);
      if (receiverSocketId) io.to(receiverSocketId).emit("newMessage", socketPayload);
    }

    res.status(201).json(socketPayload);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ error: "Message not found" });

    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    message.deleted = true;
    message.text = "This message was deleted";
    message.image = null;
    message.fileUrl = null;
    await message.save();

    const targetId = message.groupId || message.receiverId;
    if (message.groupId) {
      const group = await Group.findById(message.groupId).lean();
      group?.members.forEach(m => {
        const sid = getReceiverSocketId(m);
        if (sid) io.to(sid).emit("messageDeleted", { messageId });
      });
    } else {
      const sid = getReceiverSocketId(targetId);
      if (sid) io.to(sid).emit("messageDeleted", { messageId });
    }

    res.status(200).json({ success: true, messageId });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const markAsSeen = async (req, res) => {
  try {
    const { id: chatId } = req.params;
    const myId = req.user._id;

    await Message.updateMany(
      { 
        $or: [
          { senderId: chatId, receiverId: myId },
          { groupId: chatId, senderId: { $ne: myId } }
        ],
        readBy: { $ne: myId }
      },
      { $addToSet: { readBy: myId } }
    );

    const senderSocketId = getReceiverSocketId(chatId);
    if (senderSocketId) io.to(senderSocketId).emit("messagesSeen", { chatId, seenBy: myId });

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const handleAIFeature = async (req, res) => {
  try {
    const { feature, message: latestMessage, chatId } = req.body;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: chatId },
        { senderId: chatId, receiverId: myId },
        { groupId: chatId },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(30)
      .populate("senderId", "fullName")
      .lean();

    const chatHistory = messages
      .reverse()
      .map((m) => ({
        role: m.senderId?._id?.toString() === myId.toString() ? "user" : "assistant",
        sender: m.senderId?.fullName || "Someone",
        text: m.text || ""
      }))
      .filter(m => m.text);

    // Use the explicitly passed message if provided, else derive from history
    const messageToAnalyze = latestMessage || 
      (chatHistory.filter(m => m.role === "assistant").pop()?.text) || 
      (chatHistory[chatHistory.length - 1]?.text) || 
      "";

    console.log(`[Controller] AI Feature: "${feature}", Message: "${messageToAnalyze.substring(0, 60)}"`);

    const aiResponse = await getAIResponse(feature, messageToAnalyze, chatHistory);
    console.log(`[Controller] AI response received for "${feature}"`);
    res.status(200).json(aiResponse);
  } catch (error) {
    console.error("Error in handleAIFeature: ", error.message);
    res.status(500).json({ error: "AI Assistant is temporarily unavailable." });
  }
};

export const getAIRecommendations = async (req, res) => {
  try {
    const { id: chatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: chatId },
        { senderId: chatId, receiverId: myId },
        { groupId: chatId },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const chatHistory = messages
      .reverse()
      .map((m) => `${m.senderId.toString() === myId.toString() ? "Me" : "Them"}: ${m.text}`)
      .join("\n");

    const recommendations = await generateAIRecommendations(chatHistory);
    res.status(200).json(recommendations || []);
  } catch (error) {
    res.status(200).json([]);
  }
};

export const getChatSummary = async (req, res) => {
  try {
    const { id: chatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: chatId },
        { senderId: chatId, receiverId: myId },
        { groupId: chatId },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    if (messages.length === 0) {
      return res.status(200).json({ summary: "No messages yet." });
    }

    const chatHistory = messages
      .reverse()
      .map((m) => `${m.senderId.toString() === myId.toString() ? "Me" : "Them"}: ${m.text}`)
      .join("\n");

    const summary = await generateAISummary(chatHistory);
    res.status(200).json({ summary: summary || "Conversations are too brief for a summary." });
  } catch (error) {
    res.status(200).json({ summary: "AI Summary is currently unavailable." });
  }
};
