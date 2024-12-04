import express from "express";
import { body, param } from "express-validator";
import {
  uploadFile,
  getFiles,
  getFileById,
  updateFile,
  deleteFile,
} from "../controllers/FileController";
import { authenticateRoute, isAdmin } from "../middlewares/authenticateRoute";
import { validateRequest } from "../middlewares/validateRequest";
import multer from "multer";

const router = express.Router();

// Common validation rules for file uploads
const fileValidationRules = [
  param("id").isMongoId().withMessage("User ID must be a valid MongoID"),
];

const upload = multer({ storage: multer.memoryStorage() });

// Middleware to authenticate and authorize
router.use(authenticateRoute);
router.use(isAdmin);

// Upload a file with validation
router.post(
  "/upload/:model/:id",
  fileValidationRules,
  validateRequest,
  upload.single("file"),
  uploadFile
);

// Get a specific file by ID with validation
router.get(
  "/:id",
  [param("id").isMongoId().withMessage("File ID must be a valid MongoID")],
  validateRequest,
  getFileById
);

// Get all files
router.get("/", getFiles);

// Update a file with validation
router.put(
  "/:id",
  [
    param("id").isMongoId().withMessage("File ID must be a valid MongoID"),
    ...fileValidationRules, // Spread the common validation rules
  ],
  validateRequest,
  updateFile
);

// Delete a file by ID with validation
router.delete(
  "/:id",
  [param("id").isMongoId().withMessage("File ID must be a valid MongoID")],
  validateRequest,
  deleteFile
);

export default router;
