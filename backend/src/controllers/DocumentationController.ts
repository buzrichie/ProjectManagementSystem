import { Chapter } from "../models/ChapterModel";
import { Documentation } from "../models/DocumentationModel";
import { File } from "../models/FileModel";
import { saveFileToStorage } from "../utils/saveFileToStorage";

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

// Define the correct chapter order
const CHAPTER_ORDER = [
  "Introduction",
  "Literature Review",
  "Methodology",
  "Results and Analysis",
  "Conclusion",
];

// Upload final documentation file after all chapters are uploaded & approved
export const uploadDocumentationFile = async (req: any, res: any) => {
  try {
    const { documentationId } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Find the documentation
    const documentation = await Documentation.findById(documentationId);
    if (!documentation) {
      return res
        .status(404)
        .json({ error: "No documentation reference found" });
    }

    // Ensure all chapters are uploaded and approved
    for (const chapterName of CHAPTER_ORDER) {
      const chapter = await Chapter.findOne({
        name: chapterName,
        documentationId,
      });

      if (!chapter || !chapter.fileUrl) {
        return res.status(400).json({
          error: `Cannot upload final document. "${chapterName}" is missing.`,
        });
      }

      if (chapter.status.toLowerCase() !== "approved") {
        return res.status(400).json({
          error: `Cannot upload final document. "${chapterName}" is not approved yet.`,
        });
      }
    }

    // Generate file path
    const filePath = `uploads/documentation/${documentation._id}/${file.originalname}`;

    // Save file to storage (e.g., cloud storage or file system)
    await saveFileToStorage(file, filePath);

    // Save file metadata to the database
    const metadata = {
      associatedModel: "documentation",
      associatedModelId: documentation._id,
      filePath,
      fileName: file.originalname,
      size: file.size,
      fileType: file.mimetype,
      uploadedBy: req.user?.id,
    };

    const savedFile = await File.create(metadata);
    if (!savedFile) {
      throw new Error("Error saving file metadata to the database");
    }

    // Update final document info in documentation
    documentation.finalDocument = {
      fileUrl: filePath,
      status: "Pending Approval",
      submissionDate: new Date(),
    };

    await documentation.save();

    return res.status(201).json({
      message: "Final documentation uploaded successfully",
      file: savedFile,
    });
  } catch (error: any) {
    console.error("Error uploading documentation:", error);
    return res.status(500).json({
      error: "Error uploading documentation",
      message: error.message,
    });
  }
};
