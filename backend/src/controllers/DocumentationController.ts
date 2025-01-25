import { Documentation } from "../models/DocumentationModel";

// Create a new documentation
export const createDocumentation = async (req: any, res: any) => {
  try {
    const { projectId, groupId, chapters, finalDocument } = req.body;

    const newDocumentation = new Documentation({
      projectId,
      groupId,
      chapters,
      finalDocument,
    });

    const savedDocumentation = await newDocumentation.save();

    return res.status(201).json(savedDocumentation);
  } catch (error: any) {
    console.error("Error creating documentation:", error);
    return res.status(500).json({
      error: "Error creating documentation",
      message: error.message,
    });
  }
};

// Get all documentation records
export const getDocumentations = async (req: any, res: any) => {
  try {
    const { projectId, groupId } = req.query;

    const query: any = {};
    if (projectId) query.projectId = projectId;
    if (groupId) query.groupId = groupId;
    const assessRoles = ["super_admin", "admin", "hod", "project_coordinator"];
    let documentations;
    if (assessRoles.includes(req.user.role)) {
      documentations = await Documentation.find(query)
        .populate("projectId groupId chapters.chapterId")
        .lean();
    } else {
    }
    return res.status(200).json(documentations);
  } catch (error: any) {
    console.error("Error fetching documentations:", error);
    return res.status(500).json({
      error: "Error fetching documentations",
      message: error.message,
    });
  }
};

// Get a single documentation by ID
export const getDocumentationById = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const documentation = await Documentation.findById(id)
      .populate("projectId groupId chapters")
      .lean();

    if (!documentation) {
      return res.status(404).json({ message: "Documentation not found" });
    }

    return res.status(200).json(documentation);
  } catch (error: any) {
    console.error("Error fetching documentation:", error);
    return res.status(500).json({
      error: "Error fetching documentation",
      message: error.message,
    });
  }
};

export const getGroupDocumentations = async (req: any, res: any) => {
  const { groupId } = req.params;

  try {
    const documentation = await Documentation.findOne({ groupId })
      .populate("chapters")
      .exec();

    if (!documentation) {
      return res
        .status(404)
        .json({ message: "No documentations found for this group." });
    }

    res.status(200).json(documentation);
  } catch (error) {
    res.status(500).json({ message: "Error fetching documentations.", error });
  }
};

// Update a documentation record
export const updateDocumentation = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const updatedDocumentation = await Documentation.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    ).populate("projectId groupId chapters");

    if (!updatedDocumentation) {
      return res.status(404).json({ message: "Documentation not found" });
    }

    return res.status(200).json(updatedDocumentation);
  } catch (error: any) {
    console.error("Error updating documentation:", error);
    return res.status(500).json({
      error: "Error updating documentation",
      message: error.message,
    });
  }
};

// Delete a documentation record
export const deleteDocumentation = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const deletedDocumentation = await Documentation.findByIdAndDelete(id);

    if (!deletedDocumentation) {
      return res.status(404).json({ message: "Documentation not found" });
    }

    return res
      .status(200)
      .json({ message: "Documentation deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting documentation:", error);
    return res.status(500).json({
      error: "Error deleting documentation",
      message: error.message,
    });
  }
};

// Add a chapter to a documentation
export const addChapterToDocumentation = async (req: any, res: any) => {
  try {
    const { id } = req.params; // Documentation ID
    const { chapterId, chapterName, status } = req.body;

    const documentation = await Documentation.findById(id);

    if (!documentation) {
      return res.status(404).json({ message: "Documentation not found" });
    }

    // {
    documentation.chapters.push(chapterId);
    //   chapterName,
    //   status: status || "Pending",
    // }

    const updatedDocumentation = await documentation.save();

    return res.status(200).json(updatedDocumentation);
  } catch (error: any) {
    console.error("Error adding chapter to documentation:", error);
    return res.status(500).json({
      error: "Error adding chapter to documentation",
      message: error.message,
    });
  }
};

// Update the final document for a documentation
export const updateFinalDocument = async (req: any, res: any) => {
  try {
    const { id } = req.params; // Documentation ID
    const { fileUrl, status, submissionDate } = req.body;

    const documentation = await Documentation.findById(id);

    if (!documentation) {
      return res.status(404).json({ message: "Documentation not found" });
    }

    documentation.finalDocument = {
      fileUrl,
      status: status || "Pending Approval",
      submissionDate: submissionDate || new Date(),
    };

    const updatedDocumentation = await documentation.save();

    return res.status(200).json(updatedDocumentation);
  } catch (error: any) {
    console.error("Error updating final document:", error);
    return res.status(500).json({
      error: "Error updating final document",
      message: error.message,
    });
  }
};
