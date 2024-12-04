import express from "express";
import { body, param } from "express-validator";
import {
  createNotification,
  getNotifications,
  getNotificationById,
  updateNotification,
  deleteNotification,
} from "../controllers/NotificationController";
import { authenticateRoute, isAdmin } from "../middlewares/authenticateRoute";
import { validateRequest } from "../middlewares/validateRequest";

const router = express.Router();

// Common validation rules for notifications
const notificationValidationRules = [
  body("userId").isMongoId().withMessage("User ID must be a valid MongoID"),
  body("message")
    .isString()
    .notEmpty()
    .withMessage("Message is required and should be a string"),
  body("type")
    .isString()
    .notEmpty()
    .withMessage("Type is required and should be a string"),
];

// Middleware to authenticate and authorize
router.use(authenticateRoute);
router.use(isAdmin);

// Create a notification with validation
router.post(
  "/",
  notificationValidationRules,
  validateRequest,
  createNotification
);

// Get a specific notification by ID with validation
router.get(
  "/:id",
  [
    param("id")
      .isMongoId()
      .withMessage("Notification ID must be a valid MongoID"),
  ],
  validateRequest,
  getNotificationById
);

// Get all notifications
router.get("/", getNotifications);

// Update a notification with validation
router.put(
  "/:id",
  [
    param("id")
      .isMongoId()
      .withMessage("Notification ID must be a valid MongoID"),
    ...notificationValidationRules, // Spread the common validation rules
  ],
  validateRequest,
  updateNotification
);

// Delete a notification by ID with validation
router.delete(
  "/:id",
  [
    param("id")
      .isMongoId()
      .withMessage("Notification ID must be a valid MongoID"),
  ],
  validateRequest,
  deleteNotification
);

export default router;
