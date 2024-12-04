import express from "express";
import { body, param } from "express-validator";
import {
  createSubtask,
  getSubtasks,
  getSubtaskById,
  updateSubtask,
  deleteSubtask,
} from "../controllers/SubTaskController";
import { authenticateRoute, isAdmin } from "../middlewares/authenticateRoute";
import { validateRequest } from "../middlewares/validateRequest";

const router = express.Router();

// Common validation rules for subtasks
const subtaskValidationRules = [
  body("title")
    .isString()
    .notEmpty()
    .withMessage("Title is required and should be a string"),
  body("taskId").isMongoId().withMessage("Task ID must be a valid MongoID"),
];

// Middleware to authenticate
router.use(authenticateRoute);
router.use(isAdmin);

// Create a subtask with validation
router.post("/", subtaskValidationRules, validateRequest, createSubtask);

// Get a specific subtask by ID with validation
router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Subtask ID must be a valid MongoID")],
  validateRequest,
  getSubtaskById
);

// Get all subtasks
router.get("/", getSubtasks);

// Update a subtask with validation
router.put(
  "/:id",
  [
    param("id").isMongoId().withMessage("Subtask ID must be a valid MongoID"),
    ...subtaskValidationRules, // Spread the common validation rules
  ],
  validateRequest,
  updateSubtask
);

// Delete a subtask by ID with validation
router.delete(
  "/:id",
  [param("id").isMongoId().withMessage("Subtask ID must be a valid MongoID")],
  validateRequest,
  deleteSubtask
);

export default router;
