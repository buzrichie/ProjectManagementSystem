import express from "express";
const router = express.Router();
import { body } from "express-validator";
import rateLimit from "express-rate-limit";
import {
  authenticateRoute,
  cookieAuth,
} from "../middlewares/authenticateRoute";
import {
  register,
  login,
  logout,
  verify,
} from "../controllers/AuthControllers";

import { validateRequest } from "../middlewares/validateRequest";
const userValidator = [
  body("username")
    .trim() // Remove extra spaces
    .isLength({ max: 20 })
    .withMessage("username cannot exceed 20 characters")
    .notEmpty()
    .withMessage("username is required")
    // .isAlphanumeric()
    // .withMessage("username must be alphanumeric")
    .escape(), // Escape special characters
  body("password")
    .trim() // Remove extra spaces
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .notEmpty()
    .withMessage("Password is required")
    .escape(), // Escape special characters
];

// Define the rate limiter
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message:
    "Too many login attempts from this IP, please try again after 15 minutes",
  headers: true, // Include rate limit information in the response headers
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Controller to login
router.get("/verify", cookieAuth, verify);

router.post("/register", userValidator, validateRequest, register);

router.post("/login", userValidator, validateRequest, loginLimiter, login);

router.post("/logout", authenticateRoute, logout);

export default router;
