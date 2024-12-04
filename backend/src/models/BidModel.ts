import { Schema, model, Document } from "mongoose";
import { ITask } from "./TaskModel";
import { IUser } from "./UserModel";

export interface IBid extends Document {
  task: ITask["_id"];
  user: IUser["_id"];
  bidAmount: number;
  status: "open" | "accepted" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const BidSchema = new Schema<IBid>(
  {
    task: { type: Schema.Types.ObjectId, ref: "Task", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    bidAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["open", "accepted", "rejected"],
      default: "open",
    },
  },
  { timestamps: true }
);

export const Bid = model<IBid>("Bid", BidSchema);
