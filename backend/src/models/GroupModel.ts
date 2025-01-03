import { Schema, model, Document } from "mongoose";
import { IUser } from "./UserModel";
import { IProject } from "./ProjectModel";
import { IChatRoom } from "./ChatRoomModel";

export interface IGroup extends Document {
  name: string;
  supervisor: IUser["_id"];
  members: IUser["_id"][];
  project: IProject["_id"];
  chatroom: IChatRoom["_id"];
  createdAt: Date;
}

const GroupSchema = new Schema<IGroup>(
  {
    name: { type: String, required: true, unique: true },
    supervisor: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    members: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    project: { type: Schema.Types.ObjectId, ref: "Project" },
    chatroom: { type: Schema.Types.ObjectId, ref: "ChatRoom" },
  },
  { timestamps: true }
);

// Pre-save middleware to update users' group field
GroupSchema.pre("save", async function (next) {
  const group = this;
  await model("User").updateMany(
    { _id: { $in: group.members } }, // Find users in the group
    { $set: { group: group._id } } // Update their group field
  );
  next();
});

export const Group = model<IGroup>("Group", GroupSchema);
