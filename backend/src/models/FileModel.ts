import { Schema, model, Document } from "mongoose";
import { ITask } from "./TaskModel";
import { IUser } from "./UserModel";

// Interface for File Model
export interface IFile extends Document {
  uploadedBy: IUser["_id"]; // User who uploaded the file
  filePath: string; // Path where the file is stored
  fileType: string; // MIME type of the file
  fileName: string; // Original name of the file
  size: number; // File size in bytes
  version: number; // Version number for the file
  associatedModel: string; // Name of the associated model (e.g., "Task", "Project")
  associatedModelId: Schema.Types.ObjectId; // ID of the associated model
  createdAt: Date; // Timestamp for when the file was created
}

const FileSchema = new Schema<IFile>(
  {
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    filePath: { type: String, required: true },
    fileType: { type: String, required: true },
    fileName: { type: String, required: true },
    size: { type: Number, required: true },
    version: { type: Number, default: 1 },
    associatedModel: { type: String, required: true }, // Renamed to avoid conflict
    associatedModelId: { type: Schema.Types.ObjectId, required: true }, // Renamed to avoid conflict
  },
  { timestamps: true }
);

export const File = model<IFile>("File", FileSchema);
