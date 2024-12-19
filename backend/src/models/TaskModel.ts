import { Schema, model, Document } from "mongoose";
import { IProject } from "./ProjectModel";
import { IUser } from "./UserModel";
import { ITeam } from "./TeamModel";
import { ISubtask } from "./SubtaskModel";

export interface ITask extends Document {
  title: string;
  description: string;
  assignedTo: IUser["_id"][];
  team: ITeam["_id"][];
  project: IProject["_id"];
  subTask: ISubtask["_id"][];
  dueDate: Date;
  status:
    | "open"
    | "in progress"
    | "completed"
    | "pending approval"
    | "approved";
  priority: "low" | "medium" | "high";
  // dependencies: ITask["_id"][];
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    team: { type: Schema.Types.ObjectId, ref: "Team" },
    subTask: [{ type: Schema.Types.ObjectId, ref: "Subtask" }],
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    status: {
      type: String,
      enum: [
        "open",
        "in progress",
        "completed",
        "pending approval",
        "approved",
      ],
      default: "open",
    },
    dueDate: { type: Date, required: true },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    // dependencies: [{ type: Schema.Types.ObjectId, ref: "Task" }],
  },
  { timestamps: true }
);

export const Task = model<ITask>("Task", TaskSchema);
