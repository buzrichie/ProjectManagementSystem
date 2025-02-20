import express from "express";
import { body, param } from "express-validator";
import {
  authenticateRoute,
  isAdmin,
  hasRole,
} from "../middlewares/authenticateRoute";
import { validateRequest } from "../middlewares/validateRequest";
import {
  createProjectBrief,
  getProjectBriefs,
  getProjectBriefById,
  updateProjectBrief,
  deleteProjectBrief,
} from "../controllers/ProjectBriefController";

const router = express.Router();

// Validation rules for project brief creation and updates
const projectBriefValidationRules = [
  body("name").isString().notEmpty().withMessage("Project name is required"),
  body("description")
    .isString()
    .notEmpty()
    .withMessage("Project description is required"),
  body("objectives")
    .isString()
    .notEmpty()
    .withMessage("Project description is required"),
  // body("objectives").optional().isArray(),
  // body("technologies").optional().isArray(),
];

// Middleware to authenticate
router.use(authenticateRoute);

// Create a project brief
router.post(
  "/",
  hasRole(["student", "admin", "hod", "project_coordinator"]),
  projectBriefValidationRules,
  validateRequest,
  createProjectBrief
);

// Get a specific project brief by ID
router.get(
  "/:id",
  [
    param("id")
      .isMongoId()
      .withMessage("Project Brief ID must be a valid MongoID"),
  ],
  validateRequest,
  getProjectBriefById
);

// Get all project briefs
router.get("/", isAdmin, getProjectBriefs);

// Update a project brief
router.put(
  "/:id",
  hasRole(["admin", "hod", "project_coordinator"]),
  [
    param("id")
      .isMongoId()
      .withMessage("Project Brief ID must be a valid MongoID"),
    ...projectBriefValidationRules, // Spread the common validation rules
  ],
  validateRequest,
  updateProjectBrief
);

// Delete a project brief
router.delete(
  "/:id",
  hasRole(["super_admin", "admin", "hod", "project_coordinator"]),
  [
    param("id")
      .isMongoId()
      .withMessage("Project Brief ID must be a valid MongoID"),
  ],
  validateRequest,
  deleteProjectBrief
);

export default router;
