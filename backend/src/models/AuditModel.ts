import { Schema, model, Document } from "mongoose";
import { IUser } from "./UserModel";
import { IProject } from "./ProjectModel";
import { ITask } from "./TaskModel";

export interface IAuditLog extends Document {
  action: string;
  user: IUser["_id"];
  target: IProject["_id"] | ITask["_id"];
  onModel: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    action: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    target: {
      type: Schema.Types.ObjectId,
      refPath: "onModel",
      required: true,
    },
    onModel: { type: String, required: true, enum: ["Project", "Task"] },
  },
  { timestamps: true }
);

export const AuditLog = model<IAuditLog>("AuditLog", AuditLogSchema);
