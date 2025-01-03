import express from "express";
import { body, param } from "express-validator";
import {
  createGroup,
  getGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
  addGroupMembers,
  removeGroupMember,
  getGroupMembers,
} from "../controllers/GroupController";
import {
  authenticateRoute,
  hasRole,
  isAdmin,
} from "../middlewares/authenticateRoute";
import { validateRequest } from "../middlewares/validateRequest";

const router = express.Router();

// Common validation rules for teams
const teamValidationRules = [
  body("name")
    .trim()
    .isString()
    .notEmpty()
    .withMessage("Team name is required and should be a string")
    .escape(),
  body("members")
    .trim()
    .notEmpty()
    .withMessage("Members should be an array of user IDs")
    .escape(),
];

// Middleware to authenticate
router.use(authenticateRoute);
router.use(isAdmin);

router.post(
  "/members/:groupId",
  // hasRole("super_admin"),
  // teamValidationRules,
  [param("groupId").isMongoId().withMessage("Team ID must be a valid MongoID")],
  validateRequest,
  addGroupMembers
);
router.get("/members/:groupId", getGroupMembers);
// Remove a member by ID with validation
router.delete(
  "/members/:id/:groupId",
  hasRole(["super_admin", "admin", "supervisor", "hod", "project_coordinator"]),
  [param("id").isMongoId().withMessage("User ID must be a valid MongoID")],
  [param("groupId").isMongoId().withMessage("Team ID must be a valid MongoID")],
  validateRequest,
  removeGroupMember
);

// Create a team with validation
router.post("/", teamValidationRules, validateRequest, createGroup);

// Get a specific team by ID with validation
router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Team ID must be a valid MongoID")],
  validateRequest,
  getGroupById
);

// Get all teams
router.get("/", getGroups);

// Update a team with validation
router.put(
  "/:id",
  [
    param("id").isMongoId().withMessage("Team ID must be a valid MongoID"),
    ...teamValidationRules,
  ],
  validateRequest,
  updateGroup
);

// Delete a team by ID with validation
router.delete(
  "/:id",
  hasRole(["super_admin", "admin", "supervisor", "hod", "project_coordinator"]),
  [param("id").isMongoId().withMessage("Team ID must be a valid MongoID")],
  validateRequest,
  deleteGroup
);

export default router;
