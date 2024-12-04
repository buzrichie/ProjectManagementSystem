require("dotenv").config();
import jwt from "jsonwebtoken";

// Middleware to authenticate JWT
export const authenticateSocketJWT = (socket: any, next: any) => {
  console.log("in socket auth");
  console.log(socket.handshake.query.token);

  const token = socket.handshake.query.token;
  if (token) {
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET!);

    console.log(decoded);
    if (!decoded) {
      return next(new Error("Authentication error"));
    }

    socket.user = decoded;
    next();
  } else {
    next(new Error("Authentication error"));
  }
};
