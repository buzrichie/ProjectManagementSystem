import { Schema, model, Document } from "mongoose";
import { IUser } from "./UserModel";
import { IGroup } from "./GroupModel";
import { ITask } from "./TaskModel";

export interface IProject extends Document {
  _id: Schema.Types.ObjectId;
  name: string;
  description: string;
  department: string;
  objectives: string[];
  technologies: string[];
  startDate: Date;
  endDate: Date;
  members: IUser["_id"][];
  supervisor: IUser["_id"] | IUser[];
  proposedUser: IUser["_id"];
  groups: IGroup["_id"][];
  task: ITask["_id"][];
  status: "proposed" | "approved" | "declined" | "in-progress" | "completed";
  projectType: "existing" | "new";
  createdAt?: Date;
  updatedAt?: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    objectives: [{ type: String }],
    startDate: { type: Date },
    endDate: { type: Date },
    status: {
      type: String,
      enum: ["proposed", "approved", "declined", "in-progress", "completed"],
      default: "proposed",
    },
    projectType: { type: String, enum: ["existing", "new"], required: true }, // Existing project or new proposal
    department: { type: String, required: true },
    technologies: [String], // Technologies used in the project
    task: [{ type: Schema.Types.ObjectId, ref: "Task" }],
    proposedUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    supervisor: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    groups: [{ type: Schema.Types.ObjectId, ref: "Group" }],
  },
  { timestamps: true }
);

export const Project = model<IProject>("Project", ProjectSchema);
