import { Subtask } from "../models/SubtaskModel"; // Ensure the path is correct
import { Task } from "../models/TaskModel"; // Import the Task model if needed for validation

// Create a new subtask
export const createSubtask = async (req: any, res: any) => {
  try {
    const { name, description, assignedTo, dueDate, status } = req.body;

    const { task } = req.params;
    // Validate if the parent task exists
    const parentTask = await Task.findById(task);
    if (!parentTask) {
      return res.status(404).json({ message: "Parent task not found" });
    }

    const subtask = new Subtask({
      name,
      description,
      assignedTo: assignedTo ? assignedTo : null,
      dueDate,
      status,
      parentTask: task,
    });

    const newSubtask = await subtask.save();

    // Optionally, add the subtask to the parent task's subtasks array
    parentTask.subTask.push(newSubtask._id);
    await parentTask.save();

    return res.status(201).json(newSubtask);
  } catch (error: any) {
    console.error("Error creating subtask:", error);
    return res
      .status(500)
      .json({ error: "Error creating subtask", message: error.message });
  }
};

// Get all subtasks
export const getSubtasks = async (req: any, res: any) => {
  try {
    const subtasks = await Subtask.find().populate("assignedTo task");
    return res.status(200).json(subtasks);
  } catch (error: any) {
    console.error("Error fetching subtasks:", error);
    return res
      .status(500)
      .json({ error: "Error fetching subtasks", message: error.message });
  }
};

// Get a single subtask by ID
export const getSubtaskById = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const subtask = await Subtask.findById(id).populate("assignedTo task");
    if (!subtask) {
      return res.status(404).json({ message: "Subtask not found" });
    }
    return res.status(200).json(subtask);
  } catch (error: any) {
    console.error("Error fetching subtask:", error);
    return res
      .status(500)
      .json({ error: "Error fetching subtask", message: error.message });
  }
};

// Update a subtask
export const updateSubtask = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { task } = req.body;

    // If updating the parent task, validate if the new task exists
    if (task) {
      const parentTask = await Task.findById(task);
      if (!parentTask) {
        return res.status(404).json({ message: "Parent task not found" });
      }
    }

    const updatedSubtask = await Subtask.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate("assignedTo task");

    if (!updatedSubtask) {
      return res.status(404).json({ message: "Subtask not found" });
    }
    return res.status(200).json(updatedSubtask);
  } catch (error: any) {
    console.error("Error updating subtask:", error);
    return res
      .status(500)
      .json({ error: "Error updating subtask", message: error.message });
  }
};

// Delete a subtask
export const deleteSubtask = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const subtask = await Subtask.findById(id);
    if (!subtask) {
      return res.status(404).json({ message: "Subtask not found" });
    }

    // Remove the subtask from the parent task's subtasks array
    await Task.findByIdAndUpdate(subtask.parentTask, {
      $pull: { subtasks: subtask._id },
    });

    // Delete the subtask
    await subtask.deleteOne();

    return res.status(200).json({ message: "Subtask deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting subtask:", error);
    return res
      .status(500)
      .json({ error: "Error deleting subtask", message: error.message });
  }
};
