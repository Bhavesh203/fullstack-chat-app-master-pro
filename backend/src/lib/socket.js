import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST"],
  },
});

const userSocketMap = {}; // {userId: socketId}

// Function to get socketId for a user
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;

  if (!userId) {
    console.log("No userId found, disconnecting socket.");
    socket.disconnect(); // disconnect if no userId is passed
    return;
  }

  // Store userId and socketId mapping
  userSocketMap[userId] = socket.id;

  // Emit updated list of online users
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Listen for messages and send to specific user
  socket.on("sendMessage", (message, receiverId) => {
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receiveMessage", message);
    }
  });

  // Handle disconnections
  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    if (userSocketMap[userId]) {
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
  });
});

export { io, app, server };
