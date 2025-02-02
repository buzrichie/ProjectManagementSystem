import express from "express";
import { authenticateRoute, isAdmin } from "../middlewares/authenticateRoute";
import { getDashboard } from "../controllers/DashboardController";

const router = express.Router();
// Middleware to authenticate and authorize
router.use(authenticateRoute);
router.use(isAdmin);

router.get("/", getDashboard);
export default router;
