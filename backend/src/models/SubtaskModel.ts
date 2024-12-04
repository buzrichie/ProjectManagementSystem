import { Schema, model, Document } from "mongoose";
import { ITask } from "./TaskModel";
import { IUser } from "./UserModel";

export interface ISubtask extends Document {
  task: ITask["_id"];
  name: string;
  assignedTo: IUser["_id"];
  status: "open" | "in progress" | "completed";
  createdAt: Date;
  updatedAt: Date;
}

const SubtaskSchema = new Schema<ISubtask>(
  {
    task: { type: Schema.Types.ObjectId, ref: "Task", required: true },
    name: { type: String, required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["open", "in progress", "completed"],
      default: "open",
    },
  },
  { timestamps: true }
);

export const Subtask = model<ISubtask>("Subtask", SubtaskSchema);
