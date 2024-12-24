import User from "../models/UserModel";
const bcrypt = require("bcrypt");

export const getAdminRoles = async (req: any, res: any) => {
  try {
    const { role } = req.params;

    const users = await User.find({ role: { $eq: role.toLowerCase() } }).select(
      ["_id", "username"]
    );
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
    const { password } = req.body;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      req.body.password = hashedPassword;
    }

    const updatedUser = await User.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedUser) {
      return res.status(404).json("User not found");
    }

    const userWithoutPassword = { ...updatedUser._doc };
    delete userWithoutPassword.password;
    return res.status(200).json(userWithoutPassword);
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(409).json("username already exists");
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

export const assignSupervisorToStudent = async (req: any, res: any) => {
  try {
    const { studentId, supervisorId } = req.body;

    // Validate input
    if (!studentId || !supervisorId) {
      return res
        .status(400)
        .json({ message: "Student ID and Supervisor ID are required." });
    }

    // Fetch the student and supervisor from the database
    const student = await User.findById(studentId);
    const supervisor = await User.findById(supervisorId);

    // Validate roles
    if (!student || student.role !== "student") {
      return res
        .status(404)
        .json({ message: "Student not found or invalid role." });
    }
    if (!supervisor || supervisor.role !== "supervisor") {
      return res
        .status(404)
        .json({ message: "Supervisor not found or invalid role." });
    }

    // Check if the relationship already exists
    if (student.supervisor.includes(supervisorId)) {
      return res
        .status(400)
        .json({ message: "Supervisor is already assigned to this student." });
    }

    // Assign the supervisor to the student
    student.supervisor.push(supervisorId);

    // Add the student to the supervisor's students list if not already present
    if (!supervisor.students.includes(studentId)) {
      supervisor.students.push(studentId);
    }

    // Save both records
    await student.save();
    await supervisor.save();

    return res.status(200).json({
      message: "Supervisor successfully assigned to the student.",
      student,
      supervisor,
    });
  } catch (error: any) {
    console.error("Error assigning supervisor to student:", error);
    return res.status(500).json({
      message: "Error assigning supervisor to student.",
      error: error.message,
    });
  }
};
