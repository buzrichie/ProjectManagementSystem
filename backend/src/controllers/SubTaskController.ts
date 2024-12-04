import { Subtask } from "../models/SubtaskModel"; // Make sure the path is correct

// Create a new subtask
export const createSubtask = async (req: any, res: any) => {
  try {
    const { title, description, assignedTo, dueDate, status, task } = req.body;

    const subtask = new Subtask({
      title,
      description,
      assignedTo,
      dueDate,
      status,
      task,
    });

    const newSubtask = await subtask.save();
    return res.status(201).json(newSubtask);
  } catch (error: any) {
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
    return res
      .status(500)
      .json({ error: "Error fetching subtask", message: error.message });
  }
};

// Update a subtask
export const updateSubtask = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const updatedSubtask = await Subtask.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate("assignedTo task");
    if (!updatedSubtask) {
      return res.status(404).json({ message: "Subtask not found" });
    }
    return res.status(200).json(updatedSubtask);
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: "Error updating subtask", message: error.message });
  }
};

// Delete a subtask
export const deleteSubtask = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const deletedSubtask = await Subtask.findByIdAndDelete(id);
    if (!deletedSubtask) {
      return res.status(404).json({ message: "Subtask not found" });
    }
    return res.status(200).json({ message: "Subtask deleted successfully" });
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: "Error deleting subtask", message: error.message });
  }
};
