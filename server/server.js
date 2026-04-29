const dotenv = require('dotenv');
dotenv.config();

const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  const server = http.createServer(app);

  // Socket.io setup for real-time messaging
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  // Track online users
  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // User joins with their userId
    socket.on('user:online', (userId) => {
      onlineUsers.set(userId, socket.id);
      socket.join(`user:${userId}`); // Join personal room for notifications
      io.emit('users:online', Array.from(onlineUsers.keys()));
    });

    // Join a conversation room
    socket.on('conversation:join', (conversationId) => {
      socket.join(conversationId);
    });

    // Leave a conversation room
    socket.on('conversation:leave', (conversationId) => {
      socket.leave(conversationId);
    });

    // Send message (broadcast to conversation room)
    socket.on('message:send', (data) => {
      socket.to(data.conversationId).emit('message:received', data);
    });

    // Typing indicator
    socket.on('typing:start', (data) => {
      socket.to(data.conversationId).emit('typing:start', data);
    });

    socket.on('typing:stop', (data) => {
      socket.to(data.conversationId).emit('typing:stop', data);
    });

    socket.on('disconnect', () => {
      // Remove user from online users
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }
      io.emit('users:online', Array.from(onlineUsers.keys()));
    });
  });

  // Make io accessible to routes
  app.set('io', io);

  server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`Socket.io ready for real-time messaging`);
  });
};

startServer();
