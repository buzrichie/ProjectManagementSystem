import { Socket } from "socket.io";

declare module "socket.io" {
  interface Socket {
    user: { id: string; role: string }; // Define the properties of user based on your JWT payload
  }
}
