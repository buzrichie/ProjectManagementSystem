import express from "express";
import { body, param } from "express-validator";
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  assignProjectToGroup,
  getChatProjects,
  getProjectGroups,
  getProjectMembers,
  getProjectTasks,
  getProjectFiles,
  UserChooseProject,
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
  // body("supervisor")
  //   .if(param("id").notEmpty())
  //   .isMongoId()
  //   .withMessage("Supervisor ID must be a valid MongoID"),
  // param("team")
  //   .if(param("id").notEmpty())
  //   .isMongoId()
  //   .withMessage("Team ID must be a valid MongoID"),
];

// Middleware to authenticate
router.use(authenticateRoute);
router.use(isAdmin);
// Assign a project to team members
router.post(
  "/assign",
  hasRole(["super_admin", "admin", "hod", "project_coordinator"]),
  validateRequest,
  assignProjectToGroup
);

router.post(
  "/:projectName/assign-by-select",
  hasRole("student"),
  UserChooseProject
);
// Create a project
router.post(
  "/",
  // hasRole(["super_admin", "admin", "supervisor"]),
  // upload.single("image"),
  projectValidationRules,
  validateRequest,
  createProject
);

// Get a specific project by ID with validation
router.get("/chat/", getChatProjects);
router.get(
  "/:id/task",
  [param("id").isMongoId().withMessage("Project ID must be a valid MongoID")],
  validateRequest,
  getProjectTasks
);
router.get(
  "/:id/files",
  [param("id").isMongoId().withMessage("Project ID must be a valid MongoID")],
  validateRequest,
  getProjectFiles
);
router.get(
  "/:id/members",
  [param("id").isMongoId().withMessage("Project ID must be a valid MongoID")],
  validateRequest,
  getProjectMembers
);
router.get(
  "/:id/group",
  [param("id").isMongoId().withMessage("Project ID must be a valid MongoID")],
  validateRequest,
  hasRole(["super_admin", "admin", "supervisor", "hod", "project_coordinator"]),
  getProjectGroups
);
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
  hasRole(["super_admin", "admin", "hod", "project_coordinator"]),
  [param("id").isMongoId().withMessage("Project ID must be a valid MongoID")],
  validateRequest,
  deleteProject
);

export default router;
