import express from "express";
import { body, param } from "express-validator";
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from "../controllers/TaskController";
import {
  authenticateRoute,
  hasRole,
  isAdmin,
} from "../middlewares/authenticateRoute";
import { validateRequest } from "../middlewares/validateRequest";

const router = express.Router();

// Common validation rules for tasks
const taskValidationRules = [
  body("title")
    .isString()
    .notEmpty()
    .withMessage("Title is required and should be a string"),
  body("description")
    .optional()
    .isString()
    .withMessage("Description should be a string"),
  body("dueDate")
    .optional()
    .isISO8601()
    .withMessage("Due date must be a valid ISO 8601 date"),
  body("status")
    .optional()
    .isString()
    .isIn(["pending", "in-progress", "completed"])
    .withMessage(
      "Status must be one of the following: pending, in-progress, completed"
    ),
];

// Middleware to authenticate
router.use(authenticateRoute);
router.use(isAdmin);

// Create a task with validation
router.post("/:projectId", taskValidationRules, validateRequest, createTask);

// Get a specific task by ID with validation
router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Task ID must be a valid MongoID")],
  validateRequest,
  getTaskById
);

// Get all tasks
router.get("/", getTasks);

// Update a task with validation
router.put(
  "/:id",
  hasRole(["super_admin", "team_leader"]),
  [
    param("id").isMongoId().withMessage("Task ID must be a valid MongoID"),
    ...taskValidationRules, // Spread the common validation rules
  ],
  validateRequest,
  updateTask
);

// Delete a task by ID with validation
router.delete(
  "/:id",
  hasRole(["super_admin", "team_leader"]),
  [param("id").isMongoId().withMessage("Task ID must be a valid MongoID")],
  validateRequest,
  deleteTask
);

export default router;
