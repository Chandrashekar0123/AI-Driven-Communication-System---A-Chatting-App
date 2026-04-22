import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
    credentials: true,
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) {
    const userIdStr = userId.toString();
    userSocketMap[userIdStr] = socket.id;
    console.log(`DEBUG: User ${userIdStr} connected with Socket ${socket.id}`);
    console.log("DEBUG: Current Socket Map:", userSocketMap);
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  }

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

  socket.on("disconnect", () => {
    if (userId) {
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
  });
});

export { io, app, server };
