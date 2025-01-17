import express from "express";
import { body, param } from "express-validator";
import {
  authenticateRoute,
  hasRole,
  isAdmin,
} from "../middlewares/authenticateRoute";
import { validateRequest } from "../middlewares/validateRequest";
import {
  getCreateChatRoom,
  addParticipants,
  fetchMessages,
  getUserChatRooms,
  createChatRoom,
} from "../controllers/ChatRoomController";

const router = express.Router();

// Middleware to authenticate
router.use(authenticateRoute);
router.use(isAdmin);

// Get all tasks
router.post(
  "/:chatRoomId/participants",
  [
    param("chatRoomId")
      .isMongoId()
      .withMessage("chatRoomId ID must be a valid MongoID"),
  ],
  validateRequest,
  addParticipants
);

router.get(
  "/get-or-create-chatroom/:receiverId",
  [
    param("receiverId")
      .isMongoId()
      .withMessage("receiverId ID must be a valid MongoID"),
  ],
  validateRequest,
  getCreateChatRoom
);
router.post(
  "/:receiverId",
  [
    param("receiverId")
      .isMongoId()
      .withMessage("receiverId ID must be a valid MongoID"),
  ],
  validateRequest,
  createChatRoom
);
router.get(
  "/:chatRoomId",
  [
    param("chatRoomId")
      .isMongoId()
      .withMessage("chatRoomId ID must be a valid MongoID"),
  ],
  validateRequest,
  fetchMessages
);
router.get("/", getUserChatRooms);

export default router;
