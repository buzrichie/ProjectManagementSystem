import express from "express";
import { body, param } from "express-validator";
import {
  createTeam,
  getTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
} from "../controllers/TeamController";
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

// Create a team with validation
router.post(
  "/",
  hasRole("super_admin"),
  teamValidationRules,
  validateRequest,
  createTeam
);

// Get a specific team by ID with validation
router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Team ID must be a valid MongoID")],
  validateRequest,
  getTeamById
);

// Get all teams
router.get("/", getTeams);

// Update a team with validation
router.put(
  "/:id",
  [
    param("id").isMongoId().withMessage("Team ID must be a valid MongoID"),
    ...teamValidationRules,
  ],
  validateRequest,
  updateTeam
);

// Delete a team by ID with validation
router.delete(
  "/:id",
  hasRole(["super_admin", "supervisor"]),
  [param("id").isMongoId().withMessage("Team ID must be a valid MongoID")],
  validateRequest,
  deleteTeam
);

export default router;
