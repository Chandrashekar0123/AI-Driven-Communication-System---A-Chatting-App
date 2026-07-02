import { Server } from "socket.io";
import http from "http";
import express from "express";
import User from "../models/user.model.js";
import Group from "../models/group.model.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || origin.includes("localhost") || origin.includes("127.0.0.1") || origin.includes(".vercel.app") || origin.includes("onrender.com")) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

const userSocketMap = {}; // {userId: socketId}

io.on("connection", async (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) {
    const userIdStr = userId.toString();
    userSocketMap[userIdStr] = socket.id;
    console.log(`DEBUG: User ${userIdStr} connected with Socket ${socket.id}`);
    console.log("DEBUG: Current Socket Map:", userSocketMap);
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // Join group rooms
    try {
      const groups = await Group.find({ members: userId });
      groups.forEach((group) => {
        socket.join(group._id.toString());
        console.log(`DEBUG: Socket ${socket.id} joined group room ${group._id}`);
      });
    } catch (err) {
      console.error("DEBUG: Failed to join group rooms:", err.message);
    }
  }

  // Join a specific group room dynamically (e.g. when joining a new group)
  socket.on("joinGroupRoom", (groupId) => {
    socket.join(groupId);
    console.log(`DEBUG: Socket ${socket.id} joined group room ${groupId}`);
  });

  // Typing indicators
  socket.on("typing", ({ receiverId, groupId }) => {
    if (groupId) {
      socket.to(groupId).emit("typing", { senderId: userId, groupId });
    } else {
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("typing", { senderId: userId });
      }
    }
  });

  socket.on("stopTyping", ({ receiverId, groupId }) => {
    if (groupId) {
      socket.to(groupId).emit("stopTyping", { senderId: userId, groupId });
    } else {
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("stopTyping", { senderId: userId });
      }
    }
  });

  // Seen status
  socket.on("messageSeen", ({ senderId, receiverId, messageId }) => {
    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messageSeen", { receiverId, messageId });
    }
  });

  // WebRTC Signaling
  socket.on("callUser", ({ userToCall, signalData, from, name }) => {
    const receiverSocketId = getReceiverSocketId(userToCall);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("callUser", { signal: signalData, from, name });
    }
  });

  socket.on("answerCall", (data) => {
    const receiverSocketId = getReceiverSocketId(data.to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("callAccepted", data.signal);
    }
  });

  socket.on("endCall", ({ to }) => {
    const receiverSocketId = getReceiverSocketId(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("endCall");
    }
  });

  socket.on("disconnect", async () => {
    if (userId) {
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
      try {
        await User.findByIdAndUpdate(userId, { lastSeen: new Date() });
      } catch (err) {
        console.error("DEBUG: Failed to update lastSeen:", err.message);
      }
    }
  });
});

export { io, app, server };
