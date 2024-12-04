import { Schema, model, Document } from "mongoose";
import { IUser } from "./UserModel";
import { ITeam } from "./TeamModel";

export interface IProject extends Document {
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  admin: IUser["_id"];
  projectManager: IUser["_id"];
  team: ITeam["_id"][];
  status: "active" | "completed" | "pending";
  createdAt?: Date;
  updatedAt?: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    admin: { type: Schema.Types.ObjectId, ref: "User", required: true },
    projectManager: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    team: [{ type: Schema.Types.ObjectId, ref: "Team" }],
    status: {
      type: String,
      enum: ["active", "completed", "pending"],
      default: "active",
    },
  },
  { timestamps: true }
);

export const Project = model<IProject>("Project", ProjectSchema);
