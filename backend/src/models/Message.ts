import mongoose from "mongoose";

// Message Schema
const MessageSchema = new mongoose.Schema({
  sender: String,
  userId: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
});
export const Message = mongoose.model("Message", MessageSchema);
