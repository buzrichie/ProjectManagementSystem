require("dotenv").config();
import jwt, { JwtPayload } from "jsonwebtoken";

// Middleware to authenticate JWT
export const authenticateSocketJWT = (socket: any, next: any) => {
  const token = socket.handshake.query.token;

  if (token) {
    try {
      // Verify the token
      const decoded = jwt.verify(
        token,
        process.env.ACCESS_SECRET!
      ) as JwtPayload;

      // Type guard to ensure `decoded` is a JwtPayload and has `id` and `role`
      if (typeof decoded === "object" && decoded.id && decoded.role) {
        const userId = decoded.id as string; // Explicitly type `id` as string
        const role = decoded.role as string; // Explicitly type `role` as string

        // Attach the decoded user information to the socket object
        socket.user = decoded;

        // Join rooms based on userId and role
        socket.join(userId);
        socket.join(role);

        // console.log(`User ${userId} joined rooms: [${userId}, ${role}]`);
        next();
      } else {
        throw new Error("Invalid token payload");
      }
    } catch (error) {
      console.error("JWT verification error:", error);
      next(new Error("Authentication error"));
    }
  } else {
    next(new Error("Authentication error"));
  }
};
