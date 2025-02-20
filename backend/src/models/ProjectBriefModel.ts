import { Schema, model, Document, Types } from "mongoose";

// Define the interface for Project Brief
export interface IProjectBrief extends Document {
  projectId: Types.ObjectId;
  groupId: Types.ObjectId;
  name: string;
  description: string;
  projectType: "new" | "existing";
  department: string;
  objectives: string[];
  technologies: string[];
  status: "draft" | "submitted" | "approved" | "rejected";
  createdAt?: Date;
  updatedAt?: Date;
}

// Define Mongoose Schema
const ProjectBriefSchema = new Schema<IProjectBrief>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    groupId: { type: Schema.Types.ObjectId, ref: "Group", required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    projectType: { type: String, enum: ["new", "existing"], required: true },
    department: { type: String, required: true },
    objectives: { type: [String], required: true },
    technologies: { type: [String], required: true },
    status: {
      type: String,
      enum: ["draft", "submitted", "approved", "rejected"],
      default: "draft",
    },
  },
  { timestamps: true }
);

// Export the model
export const ProjectBrief = model<IProjectBrief>(
  "ProjectBrief",
  ProjectBriefSchema
);
