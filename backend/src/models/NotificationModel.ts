import { Schema, model, Document } from "mongoose";

export interface INotification extends Document {
  message: string;
  recipient: string;
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    message: { type: String, required: true },
    recipient: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Notification = model<INotification>(
  "Notification",
  NotificationSchema
);
