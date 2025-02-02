// Load environment variables
require("dotenv").config();

// Import modules
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import bodyParser from "body-parser";
import session from "express-session";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import { Server } from "socket.io";
// Import Route modules
import authRoutes from "./routes/AuthRoutes";
import groupRoutes from "./routes/GroupRoute";
import auditRoutes from "./routes/AuditRoute";
import bidRoutes from "./routes/BidRoute";
import commentRoutes from "./routes/CommentRoute";
import fileRoutes from "./routes/FileRoute";
import notificationRoutes from "./routes/NotificationRoute";
import taskRoutes from "./routes/TaskRoute";
import subTaskRoutes from "./routes/SubTaskRoute";
import projectRoutes from "./routes/ProjectRoute";
import userRoutes from "./routes/UserRoute";
import chatRoomRoutes from "./routes/ChatRoomRoute";
import messageRoutes from "./routes/MessageRoute";
import chatperRoutes from "./routes/ChapterRoute";
import documentationRoutes from "./routes/DocumentationRoute";
import dashboardRoutes from "./routes/DashboardRoute";
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
import ChatRoom from "./models/ChatRoomModel";
import { Message } from "./models/Message";
import { getIO, initializeSocket } from "./utils/socket-io";
import http from "http";
import path from "path";

console.log(process.cwd());

// Express App
// (async () => {
//   try {
//     await mailer(
//       "richmondnyarko123@gmail.com", // Sender's email (should match MAILER_USER)
//       "richmondnyarko123@outlook.com", // Recipient's email
//       "Test Email", // Subject
//       "This is a plain text message", // Plain text body
//       "<p>This is an HTML message</p>" // HTML body
//     );
//     console.log("Email sent successfully!");
//   } catch (error) {
//     console.error("Error:", error);
//   }
// })();
const app = express();
const server = http.createServer(app);
initializeSocket(server);
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
  corsOrigin = ["https://ttu-pms.netlify.app"];
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

// const io = new Server({ cors: { origin: corsOrigin } });
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
        username: username!.toLowerCase(),
        password,
        email: process.env.ADMIN_EMAIL,
        role: "super_admin",
      });

      await adminUser.save();
    }
    const mongoose = require("mongoose");

    // try {
    //   // Step 1: Find the correct documentation for each group
    //   const groupsWithoutDocs = await Group.find({
    //     documentation: { $exists: false },
    //   });

    //   if (groupsWithoutDocs.length === 0) {
    //     console.log("No groups found without documentation.");
    //     return;
    //   }
    //   const bulkOps = [];

    //   for (let group of groupsWithoutDocs) {
    //     const documentation = await Documentation.findOne({
    //       groupId: group._id,
    //     });

    //     if (documentation) {
    //       bulkOps.push({
    //         updateOne: {
    //           filter: { _id: group._id },
    //           update: { $set: { documentation: documentation._id } },
    //         },
    //       });
    //     } else if (group._id && group.project) {
    //       const newDocumentation = new Documentation({
    //         projectId: group.project,
    //         groupId: group._id,
    //         chapters: [],
    //         finalDocument: { status: "Pending Approval", submissionDate: null },
    //       });

    //       const savedDocumentation = await newDocumentation.save();

    //       bulkOps.push({
    //         updateOne: {
    //           filter: { _id: group._id },
    //           update: { $set: { documentation: savedDocumentation._id } },
    //         },
    //       });
    //     }
    //   }

    //   if (bulkOps.length > 0) {
    //     await Group.bulkWrite(bulkOps);
    //     console.log("Bulk update completed!");
    //   } else {
    //     console.log("No groups needed to be updated.");
    //   }
    // } catch (error) {
    //   console.error("Error updating groups:", error);
    // }

    // Listen for requests
    const serverListen = app.listen(process.env.PORT || 8080, () =>
      console.log(
        `Connected successfully and listening on port ${process.env.PORT}!`
      )
    );
    // Attach the server to the Socket.IO instance
    getIO().attach(serverListen);
    // io.attach(server);
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

// Handle Socket.IO connections
getIO().on("connection", (socket: any) => {
  // Join team room
  socket.on("joinConversation", (chatroomId: any) => {
    if (!chatroomId) return;

    socket.join(chatroomId);
  });

  // Handle team messages
  socket.on("team message", async ({ chatroomId, content }: any) => {
    if (!chatroomId || !content) return;

    // Fetch the chat room from the database
    const chatRoom = await ChatRoom.findById(chatroomId);

    if (!chatRoom) {
      socket.emit("error", { message: "Chat room not found" });
      return;
    }

    // Create a new message instance using the schema
    const newMessage = {
      sender: socket.user.id,
      recipient: chatroomId,
      content,
      timestamp: new Date(),
    };

    chatRoom.messages.push(newMessage);
    const savedChat = await chatRoom.save();

    if (!savedChat) {
      socket.emit("error", { message: "Failed to save message" });
      return;
    }

    // Broadcast the message to the team room
    getIO().to(chatroomId).emit("team message", { newMessage });
  });

  socket.on("sendMessage", async (data: any) => {
    const { chatroomId, content, receiverId } = data;

    try {
      if (!content || !chatroomId) {
        console.error("Content or recipient data missing");
        return;
      }

      // Fetch the chat room from the database
      const chatRoom = await ChatRoom.findById(chatroomId);
      if (!chatRoom) {
        console.error("Chatroom not found");
        return;
      }

      const message = await Message.create({
        chatRoom: chatRoom._id,
        sender: socket.user.id,
        content: content,
      });

      if (!message) return;

      // Update lastMessage in Conversation
      chatRoom.lastMessage = content;
      chatRoom.updatedAt = Date.now();
      await chatRoom.save();

      // Populate the sender field
      const populatedMessage = await message.populate(
        "sender",
        "name email _id"
      );

      // Notify all participants about the new message
      getIO().to(chatroomId).emit("newMessage", populatedMessage);
    } catch (error) {
      console.error("Error handling sendMessage:", error);
    }
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard/", dashboardRoutes);
app.use("/api/user", userRoutes);
app.use("/api/group", groupRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/bid", bidRoutes);
app.use("/api/comment", commentRoutes);
app.use("/api/file", fileRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/task", taskRoutes);
app.use("/api/subtask", subTaskRoutes);
app.use("/api/project", projectRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/chapter", chatperRoutes);
app.use("/api/documentation", documentationRoutes);
// Serve static files from "uploads"
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));
// app.get(
//   "/api/messages/:groupId",
//   authenticateRoute,
//   async (req: any, res: any) => {
//     try {
//       const { groupId } = req.params;
//       const messages = await Message.find({ groupId }).sort({ timestamp: 1 });
//       return res.status(201).json(messages);
//     } catch (error) {
//       console.error(error);
//       return res.status(500).json(error);
//     }
//   }
// );
app.use("/api/chatroom", chatRoomRoutes);
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
