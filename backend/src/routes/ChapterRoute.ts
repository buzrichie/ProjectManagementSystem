import express from "express";
import { body, param } from "express-validator";
import { getProjectFiles } from "../controllers/ProjectController";
import {
  authenticateRoute,
  isOwnerOrAdmin,
  isAdmin,
  hasRole,
} from "../middlewares/authenticateRoute";
import { validateRequest } from "../middlewares/validateRequest";
import {
  createChapter,
  deleteChapter,
  getChapterById,
  getChapters,
  updateChapter,
  uploadChapterFile,
} from "../controllers/ChapterController";
import multer from "multer";

const router = express.Router();

// Common validation rules for project creation and updates
const projectValidationRules = [
  body("name")
    .isString()
    .notEmpty()
    .withMessage("Chapter Name is required and should be a string")
    .escape(),
];
const upload = multer({ storage: multer.memoryStorage() });

// Middleware to authenticate
router.use(authenticateRoute);
router.use(isAdmin);

router.post(
  "/:documentationId/:chapterName/upload",
  hasRole("student"),
  upload.single("file"),
  uploadChapterFile
);
// Create a project
router.post(
  "/",
  // hasRole(["super_admin", "admin", "supervisor"]),
  // upload.single("image"),
  projectValidationRules,
  validateRequest,
  createChapter
);

// Get a specific project by ID with validation
router.get(
  "/:id/files",
  [param("id").isMongoId().withMessage("Project ID must be a valid MongoID")],
  validateRequest,
  getProjectFiles
);

router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Project ID must be a valid MongoID")],
  validateRequest,
  getChapterById
);

// Get all projects
router.get("/", getChapters);

// Update a project with validation and image upload
router.put(
  "/:id",
  [
    param("id").isMongoId().withMessage("Chapter ID must be a valid MongoID"),
    ...projectValidationRules, // Spread the common validation rules
  ],
  validateRequest,
  updateChapter
);

// Delete a project by ID with validation
router.delete(
  "/:id",
  hasRole(["super_admin", "admin", "hod", "project_coordinator"]),
  [param("id").isMongoId().withMessage("Project ID must be a valid MongoID")],
  validateRequest,
  deleteChapter
);

export default router;
