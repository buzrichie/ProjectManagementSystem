require("dotenv").config();
import jwt from "jsonwebtoken";

// Middleware to authenticate JWT
export const authenticateSocketJWT = (socket: any, next: any) => {
  const token = socket.handshake.query.token;
  if (token) {
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET!);
    if (!decoded) {
      return next(new Error("Authentication error"));
    }
    socket.user = decoded;
    next();
  } else {
    next(new Error("Authentication error"));
  }
};
