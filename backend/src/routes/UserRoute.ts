import express from "express";
import {
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
router.get("/role-admins", hasRole(["super_admin"]), getAdminRoles);
router.get("/:id", getUserById);
router.get("/", hasRole(["ceo", "super_admin"]), getAllUsers);
router.put("/:id", restrictUpdateFieldsMiddleware, updateUser);
router.delete("/:id", hasRole(["ceo", "super_admin"]), deleteUser);

// Update a team with validation

export default router;
