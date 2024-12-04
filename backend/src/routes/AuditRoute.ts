import express from "express";
import { body, param } from "express-validator";
import {
  createAudit,
  getAudits,
  getAuditById,
  updateAudit,
  deleteAudit,
} from "../controllers/AuditController";
import { authenticateRoute, isAdmin } from "../middlewares/authenticateRoute";
import { validateRequest } from "../middlewares/validateRequest";

const router = express.Router();

// Common validation rules for audits
const auditValidationRules = [
  body("user").isMongoId().withMessage("User ID must be a valid MongoID"),
  body("action")
    .isString()
    .notEmpty()
    .withMessage("Action is required and should be a string"),
  body("description")
    .isString()
    .optional({ nullable: true })
    .withMessage("Description should be a string"),
  body("timestamp")
    .isISO8601()
    .toDate()
    .withMessage("Timestamp must be a valid ISO 8601 date format"),
];

// Middleware to authenticate and authorize
router.use(authenticateRoute);
router.use(isAdmin);

// Create an audit with validation
router.post("/", auditValidationRules, validateRequest, createAudit);

// Get a specific audit by ID with validation
router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Audit ID must be a valid MongoID")],
  validateRequest,
  getAuditById
);

// Get all audits (no validation needed)
router.get("/", getAudits);

// Update an audit with validation
router.put(
  "/:id",
  [
    param("id").isMongoId().withMessage("Audit ID must be a valid MongoID"),
    ...auditValidationRules, // Spread the common validation rules
  ],
  validateRequest,
  updateAudit
);

// Delete an audit by ID with validation
router.delete(
  "/:id",
  [param("id").isMongoId().withMessage("Audit ID must be a valid MongoID")],
  validateRequest,
  deleteAudit
);

export default router;
