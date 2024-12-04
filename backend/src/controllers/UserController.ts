import User from "../models/UserModel";
const bcrypt = require("bcrypt");

export const getAdminRoles = async (req: any, res: any) => {
  try {
    const users = await User.find({ role: { $ne: "student" } }).select([
      "_id",
      "username",
    ]);
    if (!users) {
      return res.status(404).json({ message: "No User available" });
    }
    return res.status(200).json(users);
  } catch (error: any) {
    console.log(error);

    return res
      .status(500)
      .json({ error: "Error fetching users", message: error.message });
  }
};

// Controller to get all users
export const getAllUsers = async (req: any, res: any) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    let users;
    if (req.admin === true) {
      users = await User.find().select("-password").skip(skip).limit(limit);
    } else {
      users = await User.find({ user: req.user.id })
        .select("-password")
        .skip(skip)
        .limit(limit);
    }
    return res.status(200).json(users);
  } catch (error: any) {
    console.error("Error getting users:", error);
    return res.status(500).json("Failed to get users");
  }
};

// Controller to get a user by ID
export const getUserById = async (req: any, res: any) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("profile");
    if (!user) {
      return res.status(404).json("User not found");
    }
    return res.status(200).json(user);
  } catch (error: any) {
    console.error("Error getting user by ID:", error);
    return res.status(500).json("Failed to get user by ID");
  }
};

// Controller to update a user by ID
export const updateUser = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { username, password } = req.body;
    let updateData;
    let hashedPassword;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
      updateData = { username, password: hashedPassword };
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData ? updateData : { username },
      {
        new: true,
      }
    );
    if (!updatedUser) {
      return res.status(404).json("User not found");
    }

    const userWithoutPassword = { ...updatedUser._doc };
    delete userWithoutPassword.password;
    return res.status(200).json(userWithoutPassword);
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(409).json("Username already exists");
    }
    console.error("Error updating user:", error);
    return res.status(500).json("Failed to update user");
  }
};

// Controller to delete a user by ID
export const deleteUser = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json("User not found");
    }
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return res.status(500).json("Failed to delete user");
  }
};
