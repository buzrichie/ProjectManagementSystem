import express from "express";
import {
  assignSupervisorToStudent,
  deleteUser,
  getAdminRoles,
  getAllUsers,
  getUserById,
  updateUser,
} from "../controllers/UserController";
import {
  authenticateRoute,
  hasRole,
  isAdmin,
} from "../middlewares/authenticateRoute";
import { restrictUpdateFieldsMiddleware } from "../middlewares/restrictUpdateFields";
import { assignProjectToUser } from "../controllers/ProjectController";

const router = express.Router();

// Middleware to authenticate
router.use(authenticateRoute);
router.use(isAdmin);

// Get all teams
router.post(
  "/assign-project/:projectName",
  // hasRole(["super_admin", "admin", "supervisor", "hod", "project_coordinator"]),
  assignProjectToUser
);
router.post(
  "/assign-supervisor",
  hasRole(["super_admin", "admin", "hod", "project_coordinator"]),
  assignSupervisorToStudent
);
router.get(
  "/:role",
  hasRole(["super_admin", "admin", "supervisor", "hod", "project_coordinator"]),
  getAdminRoles
);
router.get("/:id", getUserById);
router.get(
  "/",
  hasRole(["super_admin", "admin", "supervisor", "hod", "project_coordinator"]),
  getAllUsers
);
router.put("/:id", restrictUpdateFieldsMiddleware, updateUser);
router.delete("/:id", hasRole(["super_admin", "admin", "hod"]), deleteUser);

// Update a team with validation

export default router;
