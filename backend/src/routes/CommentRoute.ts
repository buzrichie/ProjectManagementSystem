import express from "express";
import { body, param } from "express-validator";
import {
  createComment,
  getCommentsByTask,
  getCommentById,
  updateComment,
  deleteComment,
} from "../controllers/CommentController";
import { authenticateRoute, isAdmin } from "../middlewares/authenticateRoute";
import { validateRequest } from "../middlewares/validateRequest";

export const router = express.Router();

// Common validation rules for comments
const commentValidationRules = [
  body("taskId").isMongoId().withMessage("Task ID must be a valid MongoID"),
  body("userId").isMongoId().withMessage("User ID must be a valid MongoID"),
  body("content")
    .isString()
    .notEmpty()
    .withMessage("Content is required and should be a string"),
];

// Middleware to authenticate and authorize
router.use(authenticateRoute);
router.use(isAdmin);

// Create a comment with validation
router.post("/", commentValidationRules, validateRequest, createComment);

// Get a specific comment by ID with validation
router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Comment ID must be a valid MongoID")],
  validateRequest,
  getCommentById
);

// Get all comments by task
router.get("/", getCommentsByTask);

// Update a comment with validation
router.put(
  "/:id",
  [
    param("id").isMongoId().withMessage("Comment ID must be a valid MongoID"),
    ...commentValidationRules, // Spread the common validation rules
  ],
  validateRequest,
  updateComment
);

// Delete a comment by ID with validation
router.delete(
  "/:id",
  [param("id").isMongoId().withMessage("Comment ID must be a valid MongoID")],
  validateRequest,
  deleteComment
);

export default router;
