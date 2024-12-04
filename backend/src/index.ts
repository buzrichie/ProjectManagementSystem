// Load environment variables
require("dotenv").config();

// Import modules
import fs from "node:fs";
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import bodyParser from "body-parser";
import session from "express-session";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import http from "http";
import { Server } from "socket.io";
// Import Route modules
import authRoutes from "./routes/AuthRoutes";
import teamRoutes from "./routes/TeamRoute";
import auditRoutes from "./routes/AuditRoute";
import bidRoutes from "./routes/BidRoute";
import commentRoutes from "./routes/CommentRoute";
import fileRoutes from "./routes/FileRoute";
import notificationRoutes from "./routes/NotificationRoute";
import taskRoutes from "./routes/TaskRoute";
import subTaskRoutes from "./routes/SubTaskRoute";
import projectRoutes from "./routes/ProjectRoute";
import userRoutes from "./routes/UserRoute";
// import userRoutes from "./routes/userRoutes";
// import profileRoutes from "./routes/ProfileRoutes";
// import certificateRoutes from "./routes/CertificateRoutes";
// import inquiryRoutes from "./routes/InquiryRoutes";
// import serviceRoutes from "./routes/ServiceRoutes";
// import toolRoutes from "./routes/ToolRoutes";
// import clientRoutes from "./routes/ClientRoutes";
// import upload from "./routes/upload";
// import clientSettingsRoutes from "./routes/ClientSettingsRoutes";
import User from "./models/UserModel.js";
import { authenticateSocketJWT } from "./middlewares/socketAuth";
import { Message } from "./models/Message";
import { authenticateRoute } from "./middlewares/authenticateRoute";

// Express App
const app = express();
// const server = http.createServer(app);
// const io = new Server(server, { cors: { origin: "*" } });

//Enable trust proxy to properly handle x-forwarded-for headers
app.set("trust proxy", 1);

let corsOrigin;
if (process.env.NODE_ENV === "development") {
  corsOrigin = [
    "http://localhost:4200",
    "http://localhost:8888",
    "http://localhost:8080",
    "https://c22a97bc--richfolio.netlify.live",
  ];
} else {
  corsOrigin = ["https://richfolio.netlify.app", "http://localhost:8080"];
}

//Helmet Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(mongoSanitize());
// Define a global rate limiter
const generalLimiter = rateLimit({
  windowMs: 6 * 60 * 60 * 60 * 1000,
  max: 100,
});

// Apply the global rate limiter to all routes
app.use(generalLimiter);

// Middleware to establish communications for requests
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    exposedHeaders: ["Set-Cookie"],
  })
);

const io = new Server({ cors: { origin: corsOrigin } });
// Database Connection + Spinning up a server Connection
// Connect to MongoDB Atlas
mongoose
  .connect(process.env.db_URI!)
  .then(async () => {
    // Check if an admin user exists
    const adminExists = await User.findOne({ role: "super_admin" });
    if (!adminExists) {
      // Create the admin user
      const username = process.env.ADMIN_USERNAME;
      const password = process.env.ADMIN_PASSWORD;

      const adminUser = new User({
        username,
        password,
        email: process.env.ADMIN_EMAIL,
        role: "super_admin",
      });

      await adminUser.save();
      console.log("Admin user created");
    }
    // Listen for requests
    const server = app.listen(process.env.PORT || 8080, () =>
      console.log(
        `Connected successfully and listening on port ${process.env.PORT}!`
      )
    );

    // Attach the server to the Socket.IO instance
    io.attach(server);
  })
  .catch((error: any) => {
    console.error("Database connection error:", error);
    process.exit(1);
  });

app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session Middleware
app.use(
  session({
    secret: process.env.SECRET!,
    resave: false,
    saveUninitialized: false,
    name: "admin-session",
    cookie: {
      path: "/api/auth",
      maxAge: 2 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "none",
    },
  })
);
app.use(
  session({
    secret: process.env.SECRET!,
    resave: false,
    name: "session",
    saveUninitialized: false,
    cookie: {
      path: "/",
      maxAge: 4 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "none",
    },
  })
);
// Middleware for logging request details
app.use(
  (
    req: { path: any; method: any; body: {}; params: {} },
    res: any,
    next: () => void
  ) => {
    console.log("request path:", req.path, req.method);

    if (process.env.NODE_ENV == "development") {
      if (Object.keys(req.body).length > 0) {
        console.log("request body:", req.body);
      }

      if (Object.keys(req.params).length > 0) {
        console.log("request params:", req.params);
      }
    }
    next();
  }
);
app.use((req: any, res: any, next: () => void) => {
  if (process.env.NODE_ENV == "development") {
    setTimeout(() => {
      next();
    }, 1000);
  } else {
    next();
  }
});

// Apply middleware
io.use(authenticateSocketJWT);

const userSockets = new Map();

// Handle Socket.IO connections
io.on("connection", (socket: any) => {
  console.log("in conn");
  console.log(`${socket.user.id} connected`);

  const userId = socket.user.id;

  if (userSockets.has(userId)) {
    userSockets.get(userId).forEach((s: any) => s.disconnect());
  }

  if (!userSockets.has(userId)) {
    userSockets.set(userId, []);
  }

  userSockets.get(userId).push(socket);

  // Join team room
  socket.on("join team", ({ teamId }: any) => {
    console.log({ teamId });

    if (!teamId) return;
    socket.join(teamId);
    console.log(`${userId} joined team ${teamId}`);
  });

  // Handle team messages
  socket.on("team message", async ({ teamId, message }: any) => {
    console.log({ message });

    if (!teamId || !message) return;

    // Save message to database
    const newMessage = new Message({
      teamId,
      userId: userId,
      message,
    });
    await newMessage.save();

    // Broadcast to the room
    io.to(teamId).emit("team message", {
      teamId,
      userId: userId,
      message,
      timestamp: new Date(),
    });
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log(`${userId} disconnected`);
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/bid", bidRoutes);
app.use("/api/comment", commentRoutes);
app.use("/api/file", fileRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/task", taskRoutes);
app.use("/api/subtask", subTaskRoutes);
app.use("/api/project", projectRoutes);
app.get(
  "/api/messages/:teamId",
  authenticateRoute,
  async (req: any, res: any) => {
    try {
      const { teamId } = req.params;
      const messages = await Message.find({ teamId }).sort({ timestamp: 1 });
      return res.status(201).json(messages);
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  }
);
// app.use("/api/upload", upload);
// app.use("/api/c", clientRoutes);
// app.use("/api/user", userRoutes);
// app.use("/api/profile", profileRoutes);
// app.use("/api/inquiry", inquiryRoutes);
// app.use("/api/service", serviceRoutes);
// app.use("/api/tool", toolRoutes);
// app.use("/api/client-settings", clientSettingsRoutes);

// app.use(
//   "/",
//   (
//     req: any,
//     res: { status: (arg0: number) => { json: (arg0: any) => any } }
//   ) => {
//     try {
//       return res.status(201).json({ message: "Hi welcome..." });
//     } catch (error: any) {
//       return res.status(500).json({ message: error.message });
//     }
//   }
// );

app.use(
  "*",
  (
    req: any,
    res: { status: (arg0: number) => { json: (arg0: any) => any } }
  ) => {
    res.status(404).json({ message: "route not found" });
  }
);
