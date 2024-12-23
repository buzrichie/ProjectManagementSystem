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
router.post("/assign-project/:projectName", assignProjectToUser);
router.post("/assign-supervisor", assignSupervisorToStudent);
router.get(
  "/:role",
  hasRole(["super_admin", "admin", "supervisor"]),
  getAdminRoles
);
router.get("/:id", getUserById);
router.get("/", hasRole(["super_admin", "admin", "supervisor"]), getAllUsers);
router.put("/:id", restrictUpdateFieldsMiddleware, updateUser);
router.delete(
  "/:id",
  hasRole(["super_admin", "admin", "supervisor"]),
  deleteUser
);

// Update a team with validation

export default router;
