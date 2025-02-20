import hashPassword from "../utils/passwordHash.js";

import { Schema, model, Document } from "mongoose";
import { ITask } from "./TaskModel.js";
import { IProject } from "./ProjectModel.js";
import { IGroup } from "./GroupModel.js";

export interface IUser extends Document {
  _id: any;
  username: string;
  email: string;
  staffId: string;
  password: string;
  role:
    | "student"
    | "super_admin"
    | "admin"
    | "hod"
    | "supervisor"
    | "project_coordinator";
  profile: {
    name: string;
    department: string;
    position: string;
  };
  supervisor: IUser[];
  students: IUser[];
  task: ITask["_id"][];
  group?: IGroup["_id"] | IGroup;
  project?: IProject["_id"] | IProject;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
  _doc?: any;
}

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String },
    staffId: { type: String },
    password: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: [
        "student",
        "super_admin",
        "hod",
        "supervisor",
        "admin",
        "project_coordinator",
      ],
    },
    profile: {
      name: { type: String },
      department: { type: String },
      position: { type: String },
    },
    supervisor: [{ type: Schema.Types.ObjectId, ref: "User" }],
    students: [{ type: Schema.Types.ObjectId, ref: "User" }],
    project: { type: Schema.Types.ObjectId, ref: "Project" },
    group: { type: Schema.Types.ObjectId, ref: "Group" },
    task: [{ type: Schema.Types.ObjectId, ref: "Task" }],
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

// Pre-Save Hook: This function will be executed before saving the user data
userSchema.pre("save", async function (next) {
  // Add any pre-processing logic or data validation here before saving
  // For example, you can sanitize the input fields or perform additional validation checks
  if (this.isModified("password")) {
    try {
      this.password = await hashPassword(this.password);
    } catch (error) {
      throw Error("Password hashing couldn't complete");
    }
  }
  next(); // Call next() to proceed with the save operation
});

// Post-Save Hook: This function will be executed after saving the user data
userSchema.post("save", function (doc, next) {
  // Perform any post-processing tasks or additional operations here

  next(); // Call next() to move to the next middleware in the save process
});

const User = model<IUser>("User", userSchema);
export default User;
