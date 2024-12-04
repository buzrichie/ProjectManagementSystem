import { Schema, model, Document } from "mongoose";
import { IUser } from "./UserModel";
import { IProject } from "./ProjectModel";

export interface ITeam extends Document {
  name: string;
  projectManager: IUser["_id"];
  members: IUser["_id"][];
  project: IProject["_id"];
  createdAt: Date;
}

const TeamSchema = new Schema<ITeam>(
  {
    name: { type: String, required: true, unique: true },
    projectManager: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    members: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    project: { type: Schema.Types.ObjectId, ref: "Project" },
  },
  { timestamps: true }
);

export const Team = model<ITeam>("Team", TeamSchema);
