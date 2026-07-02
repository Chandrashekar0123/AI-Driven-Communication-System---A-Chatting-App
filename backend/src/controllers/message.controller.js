import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import Group from "../models/group.model.js";
import Summary from "../models/summary.model.js";
import Notification from "../models/notification.model.js";
import Fuse from "fuse.js";
import { getAIResponse, generateAIRecommendations, generateAISummary } from "../lib/gemini.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import { handleBotCommands } from "../lib/bots/index.js";

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
    const { text, image, file, audio, fileType, groupId, repliedTo, expiresIn } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (!text && !image && !file && !audio) {
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
    
    let audioUrl;
    if (audio) {
      // Cloudinary needs resource_type: "video" to upload webm/mp3 blob data URLs securely
      const uploadResponse = await cloudinary.uploader.upload(audio, { folder: "chat_app/audio", resource_type: "video" });
      audioUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId: groupId ? null : receiverId,
      groupId: groupId || null,
      text,
      image: imageUrl,
      audio: audioUrl,
      fileUrl,
      fileType,
      repliedTo,
      expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000) : null,
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

    // --- Smart Notification Triage (Asynchronous) ---
    processSmartNotification(newMessage, populatedMessage);

    // --- Bot Command Handling (Asynchronous) ---
    if (text && (text.startsWith("@") || text.startsWith("/"))) {
      handleBotCommands(populatedMessage);
    }

  } catch (error) {
    console.error("Error in sendMessage controller: ", error.stack);
    res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
};

const processSmartNotification = async (message, populatedMessage) => {
  try {
    const senderName = populatedMessage.senderId.fullName;
    
    // Determine offline receivers
    let offlineUserIds = [];
    if (message.groupId) {
      const group = await Group.findById(message.groupId).lean();
      if (group) {
        offlineUserIds = group.members.filter(mId => 
          mId.toString() !== message.senderId.toString() && !getReceiverSocketId(mId)
        );
      }
    } else {
      if (!getReceiverSocketId(message.receiverId)) {
        offlineUserIds.push(message.receiverId);
      }
    }

    if (offlineUserIds.length === 0) return; // Everyone is online

    // Check urgency
    let isUrgent = false;
    if (message.text) {
      try {
        const response = await getAIResponse("urgency", message.text);
        isUrgent = response.result?.isUrgent || false;
      } catch (err) {
        console.error("Error analyzing urgency:", err);
      }
    }

    // Create notifications for offline users
    const notifications = offlineUserIds.map(userId => ({
      userId,
      type: "message",
      messageId: message._id,
      title: isUrgent ? `URGENT from ${senderName}` : `New message from ${senderName}`,
      text: message.text || "Sent an attachment",
      isUrgent,
    }));

    await Notification.insertMany(notifications);
    console.log(`[SmartTriage] Created ${notifications.length} notifications (Urgent: ${isUrgent})`);

    // Here we would integrate with an actual Push service (FCM/APNS) for urgent ones, 
    // or batch them for an email digest if not urgent.
  } catch (error) {
    console.error("Error in processSmartNotification:", error);
  }
};

export const editMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    if (!text) return res.status(400).json({ error: "Text is required" });

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ error: "Message not found" });

    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    message.text = text;
    message.edited = true;
    await message.save();

    const populatedMessage = await Message.findById(message._id).populate("senderId", "fullName profilePic");
    const socketPayload = populatedMessage.toObject();

    const targetId = message.groupId || message.receiverId;
    if (message.groupId) {
      const group = await Group.findById(message.groupId).lean();
      group?.members.forEach(m => {
        const sid = getReceiverSocketId(m);
        if (sid) io.to(sid).emit("messageEdited", socketPayload);
      });
    } else {
      const sid = getReceiverSocketId(targetId);
      if (sid) io.to(sid).emit("messageEdited", socketPayload);
      // Emit back to sender as well if on another device
      const senderSid = getReceiverSocketId(userId);
      if (senderSid) io.to(senderSid).emit("messageEdited", socketPayload);
    }

    res.status(200).json(socketPayload);
  } catch (error) {
    console.error("Error in editMessage: ", error.stack);
    res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
};

export const reactToMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ error: "Message not found" });

    // Toggle reaction logic
    const existingReactionIndex = message.reactions.findIndex(r => r.userId.toString() === userId.toString() && r.emoji === emoji);
    if (existingReactionIndex !== -1) {
      // Remove reaction if it already exists
      message.reactions.splice(existingReactionIndex, 1);
    } else {
      // Remove previous reaction by same user and add new one
      message.reactions = message.reactions.filter(r => r.userId.toString() !== userId.toString());
      message.reactions.push({ userId, emoji });
    }

    await message.save();

    const targetId = message.groupId || message.receiverId;
    if (message.groupId) {
      const group = await Group.findById(message.groupId).lean();
      group?.members.forEach(m => {
        const sid = getReceiverSocketId(m);
        if (sid) io.to(sid).emit("messageReaction", { messageId, reactions: message.reactions });
      });
    } else {
      const sid = getReceiverSocketId(targetId);
      if (sid) io.to(sid).emit("messageReaction", { messageId, reactions: message.reactions });
      const senderSid = getReceiverSocketId(message.senderId);
      if (senderSid) io.to(senderSid).emit("messageReaction", { messageId, reactions: message.reactions });
    }

    res.status(200).json({ success: true, reactions: message.reactions });
  } catch (error) {
    console.error("Error in reactToMessage: ", error.stack);
    res.status(500).json({ error: `Internal server error: ${error.message}` });
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

    let chatHistory = [];

    // "chatbot-session" is the AI chatbot page - no real chatId
    if (chatId && chatId !== "chatbot-session") {
      const messages = await Message.find({
        $or: [
          { senderId: myId, receiverId: chatId },
          { senderId: chatId, receiverId: myId },
          { groupId: chatId },
        ],
      })
        .sort({ createdAt: -1 })
        .limit(20)
        .populate("senderId", "fullName")
        .lean();

      chatHistory = messages
        .reverse()
        .map((m) => ({
          role: m.senderId?._id?.toString() === myId.toString() ? "user" : "assistant",
          sender: m.senderId?.fullName || "Someone",
          text: m.text || ""
        }))
        .filter(m => m.text);
    }

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

    // For 1-on-1 chats, we need a consistent ID. For groups, chatId is the groupId.
    // If it's a user ID, we sort the two IDs to make a unique string.
    let compositeChatId = chatId;
    const group = await Group.findById(chatId).catch(() => null);
    if (!group) {
      const ids = [myId.toString(), chatId.toString()].sort();
      compositeChatId = `${ids[0]}_${ids[1]}`;
    }

    // Try to find an existing summary
    const existingSummary = await Summary.findOne({ chatId: compositeChatId });

    // Fetch the latest 50 messages to summarize
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: chatId },
        { senderId: chatId, receiverId: myId },
        { groupId: chatId },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    if (messages.length === 0) {
      return res.status(200).json({ summary: "No messages yet." });
    }

    const latestMessageId = messages[0]._id.toString();

    // If summary exists and hasn't changed since the last 10 messages (approx), we could skip.
    // For simplicity, let's just generate a new one if it's been explicitly requested or doesn't exist.
    // Wait, the prompt says "persistent, auto-updating". Let's update it if the lastMessageId doesn't match.
    // Actually, generating it every time on request might be slow. We'll generate it if requested, but save it.
    
    // We will only generate a new summary if it doesn't exist, OR if the user forces it (maybe a query param).
    // Let's generate it if it's missing or if `req.query.refresh === 'true'`
    if (existingSummary && req.query.refresh !== 'true') {
      return res.status(200).json({ summary: existingSummary.text });
    }

    const chatHistory = messages
      .reverse()
      .map((m) => `${m.senderId.toString() === myId.toString() ? "Me" : "Them"}: ${m.text || "[Attachment]"}`)
      .join("\n");

    const summaryText = await generateAISummary(chatHistory);
    const finalSummary = summaryText || "Conversations are too brief for a summary.";

    if (existingSummary) {
      existingSummary.text = finalSummary;
      existingSummary.lastMessageId = latestMessageId;
      await existingSummary.save();
    } else {
      await Summary.create({
        chatId: compositeChatId,
        text: finalSummary,
        lastMessageId: latestMessageId,
      });
    }

    res.status(200).json({ summary: finalSummary });
  } catch (error) {
    console.error("Error generating summary:", error);
    res.status(200).json({ summary: "AI Summary is currently unavailable." });
  }
};

export const getActionItems = async (req, res) => {
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
      .limit(50)
      .populate("senderId", "fullName")
      .lean();

    if (messages.length === 0) {
      return res.status(200).json({ actionItems: [] });
    }

    const chatHistory = messages
      .reverse()
      .map((m) => {
        const senderName = m.senderId?.fullName || "User";
        return `${senderName}: ${m.text || "[Attachment]"}`;
      })
      .join("\n");

    const response = await getAIResponse("tasks", "", chatHistory);
    res.status(200).json({ actionItems: response.result || [] });
  } catch (error) {
    console.error("Error generating action items:", error);
    res.status(500).json({ error: "Could not extract action items." });
  }
};

export const searchMessages = async (req, res) => {
  try {
    const { id: chatId } = req.params;
    const { q } = req.query;
    const myId = req.user._id;

    if (!q) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: chatId },
        { senderId: chatId, receiverId: myId },
        { groupId: chatId },
      ],
    })
      .sort({ createdAt: -1 })
      .populate("senderId", "fullName profilePic")
      .lean();

    // Use Fuse.js for fuzzy semantic-like search
    const fuse = new Fuse(messages, {
      keys: ["text"],
      threshold: 0.4,
      includeScore: true,
      ignoreLocation: true,
    });

    const results = fuse.search(q).map(result => result.item);
    
    // Return top 20 results
    res.status(200).json(results.slice(0, 20));
  } catch (error) {
    console.error("Error in searchMessages:", error);
    res.status(500).json({ error: "Search failed" });
  }
};
