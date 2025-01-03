import mongoose, { Schema, Document, Types } from "mongoose";

// Message Subschema
const MessageSchema = new Schema({
  sender: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Reference to the user who sent the message
  recipient: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Reference to the user who sent the message
  content: { type: String, required: true }, // Message content
  timestamp: { type: Date, default: Date.now }, // Time the message was sent
  read: { type: Boolean, default: false },
});

// ChatRoom Schema
const ChatRoomSchema = new Schema({
  name: { type: String }, // Room name (e.g., "Group Alpha - Project X")
  project: { type: Schema.Types.ObjectId, ref: "Project" }, // Associated project
  group: { type: Schema.Types.ObjectId, ref: "Group" }, // Associated Group
  participants: [{ type: Schema.Types.ObjectId, ref: "User" }], // List of participants in the chat room
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  messages: [MessageSchema], // Array of messages
  lastMessage: { type: String }, // Preview of the last message
  type: { type: String, enum: ["group", "one-to-one"], default: "one-to-one" },
  createdAt: { type: Date, default: Date.now }, // Chat room creation time
  updatedAt: { type: Date, default: Date.now }, // Last activity in the chat room
});

// Middleware to update the `updatedAt` field whenever a new message is added
ChatRoomSchema.pre("save", function (next) {
  if (this.isModified("messages")) {
    this.updatedAt = new Date();
  }
  next();
});

// Export the ChatRoom Model
export interface IMessage {
  sender: Types.ObjectId;
  recipient: Types.ObjectId;
  content: string;
  timestamp: Date;
}

export interface IChatRoom extends Document {
  name: string;
  project: Types.ObjectId;
  group: Types.ObjectId;
  participants: Types.ObjectId[];
  messages: IMessage[];
  lastMessage: { type: String };
  type: "group" | "one-to-one";
  createdAt: Date;
  updatedAt: number;
}

const ChatRoom = mongoose.model<IChatRoom>("ChatRoom", ChatRoomSchema);

export default ChatRoom;
