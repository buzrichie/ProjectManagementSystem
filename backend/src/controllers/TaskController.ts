import { Project } from "../models/ProjectModel";
import { ITask, Task } from "../models/TaskModel"; // Make sure the path is correct
import User, { IUser } from "../models/UserModel";

// Create a new task
export const createTask = async (req: any, res: any) => {
  try {
    const { title, description, assignedTo, dueDate, status, priority } =
      req.body;
    const { projectId, teamId } = req.params;

    const task: ITask = new Task({
      title,
      description,
      assignedTo: assignedTo ? assignedTo : null,
      dueDate,
      status,
      team: teamId,
      project: projectId,
      priority,
    });

    const newTask = await task.save();
    return res.status(201).json(newTask);
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: "Error creating task", message: error.message });
  }
};
// Create a new task for a project
export const createProjectTask = async (req: any, res: any) => {
  try {
    const { title, description, assignedTo, dueDate, status, priority } =
      req.body;
    const { projectId } = req.params;

    const project = await Project.findById(projectId).select("_id");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    const task: ITask = await Task.create({
      title,
      description,
      assignedTo: assignedTo ? assignedTo : null,
      dueDate,
      status,
      project: project._id,
      priority,
    });

    if (!task) {
      return res.status(404).json({ message: "Failed in creating task" });
    }
    return res.status(201).json({ data: task });
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: "Error creating task", message: error.message });
  }
};

// Get all tasks
export const getTasks = async (req: any, res: any) => {
  try {
    const tasks = await Task.find().populate("assignedTo project subTask");
    return res.status(200).json({
      data: tasks,
    });
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: "Error fetching tasks", message: error.message });
  }
};
// Get all tasks
export const getTeamProjectTasks = async (req: any, res: any) => {
  try {
    const { projectId, teamId } = req.params;
    const tasks = await Task.find({
      team: teamId,
      project: projectId,
    }).populate("assignedTo team project subTask");
    return res.status(200).json(tasks);
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: "Error fetching tasks", message: error.message });
  }
};

// Get a single task by ID
export const getTaskById = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id).populate("assignedTo project subTask");
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    return res.status(200).json(task);
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: "Error fetching task", message: error.message });
  }
};

// Update a task
export const updateTask = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    let updatedTask;
    if (req.admin === true) {
      updatedTask = await Task.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      }).populate("assignedTo project subTask");
    } else {
      updatedTask = await Task.findOneAndUpdate(
        {
          _id: id,
          team: req.user.teamId,
        },
        req.body,
        {
          new: true,
          runValidators: true,
        }
      ).populate("assignedTo project");
    }
    // const updatedTask = await Task.findByIdAndUpdate(id, req.body, {
    //   new: true,
    //   runValidators: true,
    // }).populate("assignedTo project");
    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }
    return res.status(200).json(updatedTask);
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: "Error updating task", message: error.message });
  }
};

// Delete a task
export const deleteTask = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    let deletedTask;
    if (req.admin === true) {
      deletedTask = await Task.findByIdAndDelete(id);
    } else {
      deletedTask = await Task.findOneAndDelete({
        _id: id,
        team: req.user.teamId,
      });
    }

    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found" });
    }
    return res.status(200).json({ message: "Task deleted successfully" });
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: "Error deleting task", message: error.message });
  }
};

export const assignTask = async (req: any, res: any) => {
  try {
    const { taskId } = req.params;
    const { userId } = req.body;

    // Validate taskId and userId
    if (!taskId) return res.status(400).send("Task reference required");
    if (!userId) return res.status(400).send("User reference required");

    // Fetch task
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).send("Task not found");

    // Ensure userId is an array
    const userIds = Array.isArray(userId) ? userId : [userId];

    // Track successfully assigned users and any errors
    const savedUserList: IUser["_id"][] = [];
    const assignmentErrors: string[] = [];

    // Process each user assignment
    await Promise.all(
      userIds.map(async (id) => {
        try {
          const user = await User.findById(id);
          if (!user) {
            assignmentErrors.push(`User with ID ${id} not found`);
            return;
          }
          if (task.assignedTo.includes(user._id)) {
            assignmentErrors.push(`User with ID ${id} is already assigned`);
            return;
          }
          user.task.push(task._id);
          await user.save();
          savedUserList.push(user._id);
        } catch (err: any) {
          assignmentErrors.push(
            `Error assigning User ID ${id}: ${err.message}`
          );
        }
      })
    );

    // If no assignments were successful
    if (savedUserList.length < 1) {
      return res.status(404).json({ message: assignmentErrors.join(", ") });
    }

    // Update task assignments if there are successful assignments
    task.assignedTo.push(...savedUserList);
    const savedTask = await task.save();

    // Success response
    return res.status(200).json({
      message: `Task assigned to users: ${savedUserList.join(", ")}`,
      failed: assignmentErrors.length > 0 ? assignmentErrors.join(", ") : null,
      task: savedTask,
    });
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: "Error assigning task", message: error.message });
  }
};
