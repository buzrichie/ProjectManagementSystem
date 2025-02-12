import User from "../models/UserModel";
const bcrypt = require("bcrypt");
import { getIO } from "../utils/socket-io";
import { Notification } from "../models/NotificationModel";

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
    console.error(error);

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
    let searchQuery = {};

    const assessRoles = ["super_admin", "admin", "hod", "project_coordinator"];

    if (assessRoles.includes(req.user.role)) {
      // Admin and similar roles can see all users
      users = await User.find()
        .select("-password")
        .populate("profile supervisor students project group")
        .skip(skip)
        .limit(limit);
      searchQuery = {}; // Count all users for these roles
    } else if (req.user.role === "supervisor") {
      // Supervisor can see users they supervise
      users = await User.find({ supervisor: req.user.id })
        .select("-password")
        .populate("profile supervisor students project group")
        .skip(skip)
        .limit(limit);
      searchQuery = { supervisor: req.user.id }; // Count only supervised users
    } else {
      // For other roles, only return the current user
      users = await User.find({ _id: req.user.id })
        .populate("profile supervisor students project group")
        .select("-password");
      searchQuery = { _id: req.user.id }; // Count only the current user
    }

    // Count the total projects (or total users based on the query)
    const totalProjects = await User.countDocuments(searchQuery);

    return res.status(200).json({
      data: users,
      currentPage: +page,
      totalPages: Math.ceil(totalProjects / +limit),
      totalProjects,
    });
  } catch (error: any) {
    console.error("Error getting users:", error);
    return res.status(500).json({ error: "Failed to get users" });
  }
};

// Controller to get all users with filters
export const getAllUsersAsPublic = async (req: any, res: any) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Initialize the filter object
    const filters: any = {};

    // Allow all roles (admins, students, etc.) to search with regex
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, "i"); // 'i' for case-insensitive search
      filters.$or = [
        { username: { $regex: searchRegex } },
        { email: { $regex: searchRegex } },
      ];
    }

    // Assess roles (Admin and higher roles can access all users)
    const assessRoles = [
      "super_admin",
      "admin",
      "hod",
      "project_coordinator",
      "supervisor",
    ];

    if (assessRoles.includes(req.user.role)) {
      // Admin or higher roles can see all users
      // Optionally, you can add more filters for admins like role-based filtering
      if (req.query.role) {
        filters.role = req.query.role;
      }

      // Fetch the filtered users with pagination
      const users = await User.find(filters)
        .select("_id username email role") // Return only needed fields
        .skip(skip)
        .limit(limit);

      return res.status(200).json(users);
    } else {
      // For non-admin roles, return only the current user's data or limit the data based on their role
      filters.role = req.user.role;

      // Fetch the filtered users with pagination
      const users = await User.find(filters)
        .select("_id username email role") // Return only needed fields
        .skip(skip)
        .limit(limit);

      return res.status(200).json(users);
    }
  } catch (error: any) {
    console.error("Error getting users:", error);
    return res.status(500).json({ error: "Failed to get users" });
  }
};

// Controller to get a user by ID
export const getUserById = async (req: any, res: any) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("profile supervisor students project group");
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
      return res.status(409).json("userusername already exists");
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

    // Save notifications to the Notification collection
    const notifications = [
      {
        recipient: studentId,
        message: `You have been assigned a new supervisor: ${supervisor.username}.`,
      },
      {
        recipient: supervisorId,
        message: `You have been assigned a new student: ${student.username}.`,
      },
    ];

    await Notification.insertMany(notifications);

    // Emit real-time notifications to the student and supervisor using Socket.IO
    const io = getIO();

    io.to(studentId.toString()).emit("assigned:new:supervisor", {
      message: `You have been assigned a new supervisor: ${supervisor.username}.`,
    });

    io.to(supervisorId.toString()).emit("assigned:new:student", {
      message: `You have been assigned a new student: ${student.username}.`,
    });

    // Success response
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
