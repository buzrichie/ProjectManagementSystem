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
// Import Route modules
// import userRoutes from "./routes/userRoutes";
// import profileRoutes from "./routes/ProfileRoutes";
// import certificateRoutes from "./routes/CertificateRoutes";
// import inquiryRoutes from "./routes/InquiryRoutes";
// import projectRoutes from "./routes/ProjectRoutes";
// import serviceRoutes from "./routes/ServiceRoutes";
// import toolRoutes from "./routes/ToolRoutes";
// import clientRoutes from "./routes/ClientRoutes";
// import authRoutes from "./routes/AuthRoutes";
// import upload from "./routes/upload";
// import clientSettingsRoutes from "./routes/ClientSettingsRoutes";
import User from "./models/UserModel.js";

// Express App
const app = express();

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
        role: "super_admin",
      });

      await adminUser.save();
      console.log("Admin user created");
    }
    // Listen for requests
    app.listen(process.env.PORT || 8080, () =>
      console.log(
        `Connected successfully and listening on port ${process.env.PORT}!`
      )
    );
  })
  .catch((error: any) => {
    console.error("Database connection error:", error);
  });

// Middleware to establish communications for requests
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    exposedHeaders: ["Set-Cookie"],
  })
);

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

// Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/upload", upload);
// app.use("/api/c", clientRoutes);
// app.use("/api/user", userRoutes);
// app.use("/api/profile", profileRoutes);
// app.use("/api/certificate", certificateRoutes);
// app.use("/api/inquiry", inquiryRoutes);
// app.use("/api/project", projectRoutes);
// app.use("/api/service", serviceRoutes);
// app.use("/api/tool", toolRoutes);
// app.use("/api/client-settings", clientSettingsRoutes);

app.use(
  "/",
  (
    req: any,
    res: { status: (arg0: number) => { json: (arg0: any) => any } }
  ) => {
    try {
      return res.status(201).json({ message: "Hi welcome" });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
);

app.use(
  "*",
  (
    req: any,
    res: { status: (arg0: number) => { json: (arg0: any) => any } }
  ) => {
    res.status(404).json({ message: "route not found" });
  }
);
