import { Schema, model, Document } from "mongoose";
import { ITask } from "./TaskModel";
import { IUser } from "./UserModel";

export interface ISubtask extends Document {
  parentTask: ITask["_id"];
  name: string;
  assignedTo: IUser["_id"];
  status: "open" | "in progress" | "completed";
  createdAt: Date;
  updatedAt: Date;
  priority: string;
}

const SubtaskSchema = new Schema<ISubtask>(
  {
    parentTask: { type: Schema.Types.ObjectId, ref: "Task", required: true },
    name: { type: String, required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["open", "in progress", "completed"],
      default: "open",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
  },
  { timestamps: true }
);

export const Subtask = model<ISubtask>("Subtask", SubtaskSchema);
