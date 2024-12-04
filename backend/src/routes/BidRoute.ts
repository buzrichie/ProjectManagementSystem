import express from "express";
import { body, param } from "express-validator";
import {
  createBid,
  getBids,
  getBidById,
  updateBid,
  deleteBid,
} from "../controllers/BidController";
import { authenticateRoute, isAdmin } from "../middlewares/authenticateRoute";
import { validateRequest } from "../middlewares/validateRequest";

const router = express.Router();

// Common validation rules for bids
const bidValidationRules = [
  body("taskId").isMongoId().withMessage("Task ID must be a valid MongoID"),
  body("userId").isMongoId().withMessage("User ID must be a valid MongoID"),
  body("amount").isNumeric().withMessage("Amount must be a numeric value"),
  body("status")
    .isString()
    .optional({ nullable: true })
    .withMessage("Status should be a string"),
];

// Middleware to authenticate and authorize
router.use(authenticateRoute);
router.use(isAdmin);

// Create a bid with validation
router.post("/", bidValidationRules, validateRequest, createBid);

// Get a specific bid by ID with validation
router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Bid ID must be a valid MongoID")],
  validateRequest,
  getBidById
);

// Get all bids (no validation needed)
router.get("/", getBids);

// Update a bid with validation
router.put(
  "/:id",
  [
    param("id").isMongoId().withMessage("Bid ID must be a valid MongoID"),
    ...bidValidationRules, // Spread the common validation rules
  ],
  validateRequest,
  updateBid
);

// Delete a bid by ID with validation
router.delete(
  "/:id",
  [param("id").isMongoId().withMessage("Bid ID must be a valid MongoID")],
  validateRequest,
  deleteBid
);

export default router;
