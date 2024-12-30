import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { authenticateSocketJWT } from "../middlewares/socketAuth";

let io: SocketIOServer | null = null;

/**
 * Initialize the Socket.IO server
 * @param httpServer - The HTTP server instance
 */
export function initializeSocket(httpServer: HTTPServer): void {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.production
        ? "https://ttu-pms.netlify.app"
        : "http://localhost:4200", // Replace '*' with your frontend's origin for security
      methods: ["GET", "POST"],
    },
  });

  // Apply middleware
  io.use(authenticateSocketJWT);
  const userSockets = new Map();

  io.on("connection", (socket: Socket) => {
    // console.log(`Client connected: ${socket.id}`);
    const userId = socket.user.id;

    if (userSockets.has(userId)) {
      userSockets.get(userId).forEach((s: any) => s.disconnect());
    }

    userSockets.set(userId, [socket]);

    // Handle custom events
    // socket.on("message", (data) => {
    //   console.log(`Message received from ${socket.id}:`, data);
    // Broadcast the message to all clients
    //   io?.emit("message", data);
    // });
    socket.on("notification", (data) => {
      // console.log(`Message received from ${socket.id}:`, data);
      // Broadcast the message to all clients
      if (!data) {
        return;
      }
      socket.join(data);
    });

    // Disconnect
    socket.on("disconnect", () => {
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          userSockets.delete(userId);
          break;
        }
      }
    });
  });
}

/**
 * Get the Socket.IO instance
 * @returns The Socket.IO server instance
 */
export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error(
      "Socket.io is not initialized. Call initializeSocket first."
    );
  }
  return io;
}
