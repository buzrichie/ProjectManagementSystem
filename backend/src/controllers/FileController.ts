import { Request, Response } from "express";
import { File } from "../models/FileModel"; // Ensure the path to the File model is correct
import { saveFileToStorage } from "../utils/saveFileToStorage";

// Upload a file
export const uploadFile = async (req: any, res: any) => {
  try {
    const { model, id } = req.params; // Extract model and ID from route
    const file = req.file; // Extract file from request

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Validate model and ID
    const validModels = ["user", "project", "document", "task", "group"];
    if (!validModels.includes(model)) {
      return res.status(400).json({ error: "Invalid model" });
    }

    // Generate file path
    const filePath = `uploads/${model}/${id}/${file.originalname}`;

    // Save file to storage (e.g., cloud storage or file system)
    await saveFileToStorage(file, filePath);

    // Save file metadata to the database
    const metadata = {
      associatedModel: model,
      associatedModelId: id,
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
    return res.status(201).json({
      message: "File uploaded successfully",
      file: savedFile,
    });
  } catch (error: any) {
    console.error("Error uploading file:", error);
    return res
      .status(500)
      .json({ error: "Error uploading file", message: error.message });
  }
};

// Get all files
export const getFiles = async (req: any, res: any) => {
  try {
    const files = await File.find().populate("uploadedBy associatedModelId");
    return res.status(200).json(files);
  } catch (error: any) {
    console.error("Error fetching files:", error);
    return res
      .status(500)
      .json({ error: "Error fetching files", message: error.message });
  }
};

// Get a single file by ID
export const getFileById = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const file = await File.findById(id).populate(
      "uploadedBy associatedModelId"
    );
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }
    res.setHeader("Content-Type", file.fileType);
    return res.status(200).json(file);
  } catch (error: any) {
    console.error("Error fetching file:", error);
    return res
      .status(500)
      .json({ error: "Error fetching file", message: error.message });
  }
};

// Update file metadata
export const updateFile = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const updatedFile = await File.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate("uploadedBy associatedModelId");
    if (!updatedFile) {
      return res.status(404).json({ error: "File not found" });
    }
    return res.status(200).json(updatedFile);
  } catch (error: any) {
    console.error("Error updating file:", error);
    return res
      .status(500)
      .json({ error: "Error updating file", message: error.message });
  }
};

// Delete a file
export const deleteFile = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const deletedFile = await File.findByIdAndDelete(id);
    if (!deletedFile) {
      return res.status(404).json({ error: "File not found" });
    }

    // Optionally remove the file from storage
    // Use fs.unlink if you're saving files on the server
    // Example: await fs.unlink(deletedFile.filePath);

    return res.status(200).json({ message: "File deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting file:", error);
    return res
      .status(500)
      .json({ error: "Error deleting file", message: error.message });
  }
};
