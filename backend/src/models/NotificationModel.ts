import { Schema, model, Document } from "mongoose";
import { IUser } from "./UserModel";

export interface INotification extends Document {
  message: string;
  recipient: IUser["_id"];
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    message: { type: String, required: true },
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Notification = model<INotification>(
  "Notification",
  NotificationSchema
);
