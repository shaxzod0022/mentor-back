const socketIo = require("socket.io");

class SocketManager {
  constructor() {
    this.io = null;
    this.users = new Map(); // userId -> socketId
  }

  init(server) {
    this.io = socketIo(server, {
      cors: {
        origin: "*", // Adjust in production
        methods: ["GET", "POST"]
      }
    });

    this.io.on("connection", (socket) => {
      console.log(`Socket connected: ${socket.id}`);

      socket.on("authenticate", (userId) => {
        if (userId) {
          this.users.set(userId.toString(), socket.id);
          socket.join(`user:${userId}`);
          console.log(`User ${userId} authenticated on socket ${socket.id}`);
        }
      });

      socket.on("join-course", (courseId) => {
        socket.join(`course:${courseId}`);
        console.log(`Socket ${socket.id} joined course room: ${courseId}`);
      });

      socket.on("disconnect", () => {
        for (const [userId, socketId] of this.users.entries()) {
          if (socketId === socket.id) {
            this.users.delete(userId);
            break;
          }
        }
        console.log(`Socket disconnected: ${socket.id}`);
      });
    });
  }

  sendToUser(userId, event, data) {
    if (this.io) {
      this.io.to(`user:${userId}`).emit(event, data);
    }
  }

  sendToRoom(room, event, data) {
    if (this.io) {
      this.io.to(room).emit(event, data);
    }
  }

  // Helper for multiple recipients
  sendToUsers(userIds, event, data) {
    if (this.io) {
      userIds.forEach(id => {
        this.io.to(`user:${id}`).emit(event, data);
      });
    }
  }
}

module.exports = new SocketManager();
