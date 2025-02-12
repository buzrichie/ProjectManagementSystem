import { ProjectBrief } from "../models/ProjectBriefModel";
import { Project } from "../models/ProjectModel";
import User from "../models/UserModel";

// Create a new Project Brief
export const createProjectBrief = async (req: any, res: any) => {
  try {
    const {
      projectId,
      name,
      description,
      projectType,
      department,
      objectives,
      technologies,
    } = req.body;
    const submittedBy = req.user?.id; // Assuming authentication middleware sets req.user

    // Validate project existence
    const projectExists = await Project.findById(projectId);
    if (!projectExists) {
      return res.status(404).json({ error: "Project not found" });
    }

    const newBrief = new ProjectBrief({
      projectId,
      name,
      description,
      projectType,
      department,
      objectives,
      technologies,
      submittedBy,
    });

    const savedBrief = await newBrief.save();
    return res
      .status(201)
      .json({
        message: "Project brief created successfully",
        projectBrief: savedBrief,
      });
  } catch (error: any) {
    console.error("Error creating project brief:", error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
  }
};

// Get all Project Briefs
export const getProjectBriefs = async (req: any, res: any) => {
  try {
    const briefs = await ProjectBrief.find().populate("projectId submittedBy");
    return res.status(200).json(briefs);
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: "Error fetching project briefs", message: error.message });
  }
};

// Get a single Project Brief by ID
export const getProjectBriefById = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const brief = await ProjectBrief.findById(id).populate(
      "projectId submittedBy"
    );

    if (!brief) {
      return res.status(404).json({ error: "Project brief not found" });
    }

    return res.status(200).json(brief);
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: "Error fetching project brief", message: error.message });
  }
};

// Update a Project Brief
export const updateProjectBrief = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const updatedBrief = await ProjectBrief.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedBrief) {
      return res.status(404).json({ error: "Project brief not found" });
    }

    return res
      .status(200)
      .json({
        message: "Project brief updated successfully",
        projectBrief: updatedBrief,
      });
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: "Error updating project brief", message: error.message });
  }
};

// Delete a Project Brief
export const deleteProjectBrief = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const deletedBrief = await ProjectBrief.findByIdAndDelete(id);

    if (!deletedBrief) {
      return res.status(404).json({ error: "Project brief not found" });
    }

    return res
      .status(200)
      .json({ message: "Project brief deleted successfully" });
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: "Error deleting project brief", message: error.message });
  }
};
