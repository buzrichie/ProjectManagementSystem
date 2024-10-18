import { Schema, model } from "mongoose";
import hashPassword from "../utils/passwordHash.js";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 20,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
    },
    role: {
      type: String,
      lowercase: true,
      required: [true, "Please add the role"],
    },
    certificates: [
      {
        type: Schema.Types.ObjectId,
        ref: "Certificate",
      },
    ],
    inquiries: [
      {
        type: Schema.Types.ObjectId,
        ref: "Inquiry",
      },
    ],
    projects: [
      {
        type: Schema.Types.ObjectId,
        ref: "Project",
      },
    ],
    services: [
      {
        type: Schema.Types.ObjectId,
        ref: "Service",
      },
    ],
    tools: [
      {
        type: Schema.Types.ObjectId,
        ref: "Tool",
      },
    ],
    profile: {
      type: Schema.Types.ObjectId,
      ref: "Profile",
    },
    clientSetting: {
      type: Schema.Types.ObjectId,
      ref: "ClientSetting",
    },
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

const User = model("user", userSchema);

export default User;
