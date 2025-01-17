import { Notification } from "../models/NotificationModel"; // Ensure the path to the Notification model is correct
import User from "../models/UserModel";

// Create a new notification
export const createNotification = async (req: any, res: any) => {
  try {
    const { recipient, message, type, readStatus } = req.body;

    const notification = new Notification({
      recipient,
      message,
      type,
      readStatus: readStatus || false, // default to unread
      createdAt: new Date(),
    });

    const newNotification = await notification.save();
    return res.status(201).json(newNotification);
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: "Error creating notification", message: error.message });
  }
};

// Get all notifications
export const getNotifications = async (req: any, res: any) => {
  try {
    // Get user ID from the authenticated request

    // Fetch the user's details from the database
    const user = await User.findById(req.user.id).select("project group");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Build a query to match notifications
    const query = {
      $or: [
        { recipient: req.user.id }, // Notifications specific to the user
        { recipient: "General" }, // General notifications
        { recipient: "New project" }, // New project notifications
        { recipient: user.group ? user.group.toString() : undefined }, // Notifications for user's groups
        { recipient: user.project ? user.project.toString() : undefined }, // Notifications for user's projects
        { recipient: req.user.role }, // Notifications for user's role
      ],
    };

    // Fetch matching notifications
    const notifications = await Notification.find(query)
      .populate("recipient")
      .sort({ createdAt: -1 }); // Sort by the most recent

    // Return the notifications
    return res.status(200).json(notifications);
  } catch (error: any) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({
      error: "Error fetching notifications",
      message: error.message,
    });
  }
};

// Get a single notification by ID
export const getNotificationById = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id).populate("recipient");
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    return res.status(200).json(notification);
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: "Error fetching notification", message: error.message });
  }
};

// Update a notification (e.g., mark as read)
export const updateNotification = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const updatedNotification = await Notification.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    ).populate("recipient");
    if (!updatedNotification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    return res.status(200).json(updatedNotification);
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: "Error updating notification", message: error.message });
  }
};

// Delete a notification
export const deleteNotification = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const deletedNotification = await Notification.findByIdAndDelete(id);
    if (!deletedNotification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    return res
      .status(200)
      .json({ message: "Notification deleted successfully" });
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: "Error deleting notification", message: error.message });
  }
};
