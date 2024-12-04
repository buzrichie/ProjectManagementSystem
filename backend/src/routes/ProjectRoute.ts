import express from "express";
import { body, param } from "express-validator";
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  assignProjectToTeam,
  getChatProjects,
} from "../controllers/ProjectController";
import {
  authenticateRoute,
  isOwnerOrAdmin,
  isAdmin,
  hasRole,
} from "../middlewares/authenticateRoute";
import { validateRequest } from "../middlewares/validateRequest";

const router = express.Router();

// Common validation rules for project creation and updates
const projectValidationRules = [
  body("name")
    .isString()
    .notEmpty()
    .withMessage("Title is required and should be a string")
    .escape(),
  body("description")
    .isString()
    .notEmpty()
    .withMessage("Description is required and should be a string")
    .escape(),
  body("projectManager")
    .isMongoId()
    .withMessage("Project Manager ID must be a valid MongoID"),
];

// Middleware to authenticate
router.use(authenticateRoute);
router.use(isAdmin);
// Assign a project to team members
router.post(
  "/assign",
  hasRole(["super_admin"]),
  validateRequest,
  assignProjectToTeam
);

// Create a project
router.post(
  "/",
  hasRole(["super_admin"]),
  // upload.single("image"),
  projectValidationRules,
  validateRequest,
  createProject
);

// Get a specific project by ID with validation
router.get("/chat/", getChatProjects);
router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Project ID must be a valid MongoID")],
  validateRequest,
  getProjectById
);

// Get all projects
router.get("/", getProjects);

// Update a project with validation and image upload
router.put(
  "/:id",
  // upload.single("image"),
  [
    param("id").isMongoId().withMessage("Project ID must be a valid MongoID"),
    ...projectValidationRules, // Spread the common validation rules
  ],
  validateRequest,
  updateProject
);

// Delete a project by ID with validation
router.delete(
  "/:id",
  [param("id").isMongoId().withMessage("Project ID must be a valid MongoID")],
  validateRequest,
  deleteProject
);

export default router;
