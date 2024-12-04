import { Schema, model, Document, Types } from "mongoose";

// Define an interface for Comment
interface IComment extends Document {
  user: Types.ObjectId;
  task: Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define the Comment schema
const commentSchema = new Schema<IComment>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    task: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt fields
  }
);

// Export the Comment model
export const Comment = model<IComment>("Comment", commentSchema);
