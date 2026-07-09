const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

let io = null;

/**
 * Initialize Socket.IO server attached to Node HTTP server
 */
const init = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*", // Allow frontend origins
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      credentials: true
    }
  });

  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.query?.token ||
        (socket.handshake.headers.authorization && socket.handshake.headers.authorization.split(" ")[1]);

      if (token && process.env.JWT_SECRET) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          socket.userId = decoded.userId || decoded._id || decoded.id;
        } catch (err) {
          // Token expired or invalid; still allow connection or log warning
          console.warn("Socket auth token verification warning:", err.message);
        }
      } else if (socket.handshake.auth?.userId) {
        socket.userId = socket.handshake.auth.userId;
      }

      next();
    } catch (err) {
      next();
    }
  });

  io.on("connection", (socket) => {
    if (socket.userId) {
      socket.join(socket.userId.toString());
      console.log(`🔌 Socket connected: ${socket.id} (User: ${socket.userId})`);
    } else {
      console.log(`🔌 Socket connected: ${socket.id} (Anonymous/Unauthenticated)`);
    }

    // Allow client to explicitly identify/authenticate user room after connection
    socket.on("register_user", (userId) => {
      if (userId) {
        socket.userId = userId.toString();
        socket.join(socket.userId);
        console.log(`🔌 Socket registered user room: ${socket.userId} on socket ${socket.id}`);
      }
    });

    socket.on("disconnect", () => {
      // Automatic cleanup by Socket.IO room system
    });
  });

  return io;
};

/**
 * Get active Socket.IO server instance
 */
const getIO = () => {
  if (!io) {
    console.warn("Socket.IO not initialized yet");
  }
  return io;
};

/**
 * Emit event to all active sockets belonging to a specific user (across all open tabs/devices)
 */
const emitToUser = (userId, event, data) => {
  if (!io || !userId) return;
  try {
    io.to(userId.toString()).emit(event, data);
  } catch (error) {
    console.error(`Socket emitToUser error (${event}):`, error.message);
  }
};

/**
 * Emit event to multiple user rooms
 */
const emitToUsers = (userIds, event, data) => {
  if (!io || !Array.isArray(userIds)) return;
  try {
    userIds.forEach((userId) => {
      if (userId) {
        io.to(userId.toString()).emit(event, data);
      }
    });
  } catch (error) {
    console.error(`Socket emitToUsers error (${event}):`, error.message);
  }
};

/**
 * Emit event to all connected sockets
 */
const emitToAll = (event, data) => {
  if (!io) return;
  try {
    io.emit(event, data);
  } catch (error) {
    console.error(`Socket emitToAll error (${event}):`, error.message);
  }
};

module.exports = {
  init,
  getIO,
  emitToUser,
  emitToUsers,
  emitToAll
};
