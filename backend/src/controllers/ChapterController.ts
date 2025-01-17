import { File } from "../models/FileModel";
import { Chapter, IChapter } from "../models/ChapterModel";
import { saveFileToStorage } from "../utils/saveFileToStorage";
import { Documentation } from "../models/DocumentationModel";

// Create a new chapter
export const createChapter = async (req: any, res: any) => {
  try {
    const {
      documentationId,
      chapterName,
      description,
      fileUrl,
      status,
      feedback,
      version,
    } = req.body;

    const newChapter = new Chapter({
      documentationId,
      chapterName,
      description,
      fileUrl,
      status,
      feedback,
      version,
    });

    const savedChapter = await newChapter.save();

    return res.status(201).json(savedChapter);
  } catch (error: any) {
    console.error("Error creating chapter:", error);
    return res.status(500).json({
      error: "Error creating chapter",
      message: error.message,
    });
  }
};
export const uploadChapterFile = async (req: any, res: any) => {
  try {
    const { chapterName, documentationId } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    if (!chapterName)
      return res.status(400).json({ error: "Chapter Name Required" });

    let chapter: IChapter | null = await Chapter.findOne({
      chapterName,
      documentationId,
    });

    if (!chapter) {
      chapter = await Chapter.create({ chapterName, documentationId });
      if (!chapter) {
        return;
      }
    }
    // Generate file path
    const filePath = `uploads/chapter/${chapter._id}/${file.originalname}`;

    // Save file to storage (e.g., cloud storage or file system)
    await saveFileToStorage(file, filePath);

    // Save file metadata to the database
    const metadata = {
      associatedModel: "chapter",
      associatedModelId: chapter._id,
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
    chapter.fileUrl = filePath;
    const savedChapter = chapter.save();
    if (!savedChapter) {
      throw new Error("Error saving file chapter fileUrl to the database");
    }
    const documentation = await Documentation.findById(documentationId);
    if (!documentation) {
      return;
    }
    const dExist = documentation.chapters.find(
      (x) => (x.chapterName = chapterName)
    );
    if (!dExist) {
      documentation.chapters.push({ chapterName, chapterId: chapter._id });
      documentation.save();
    }

    return res.status(201).json({
      message: "File uploaded successfully",
      file: savedFile,
    });
  } catch (error: any) {
    console.error("Error creating chapter:", error);
    return res.status(500).json({
      error: "Error creating chapter",
      message: error.message,
    });
  }
};

// Get all chapters
export const getChapters = async (req: any, res: any) => {
  try {
    const { documentationId } = req.query;

    const query: any = {};
    if (documentationId) {
      query.documentationId = documentationId;
    }

    const chapters = await Chapter.find(query);

    return res.status(200).json(chapters);
  } catch (error: any) {
    console.error("Error fetching chapters:", error);
    return res.status(500).json({
      error: "Error fetching chapters",
      message: error.message,
    });
  }
};

// Get a single chapter by ID
export const getChapterById = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const chapter = await Chapter.findById(id);

    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    return res.status(200).json(chapter);
  } catch (error: any) {
    console.error("Error fetching chapter:", error);
    return res.status(500).json({
      error: "Error fetching chapter",
      message: error.message,
    });
  }
};

// Update a chapter
export const updateChapter = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const updatedChapter = await Chapter.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedChapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    return res.status(200).json(updatedChapter);
  } catch (error: any) {
    console.error("Error updating chapter:", error);
    return res.status(500).json({
      error: "Error updating chapter",
      message: error.message,
    });
  }
};

// Delete a chapter
export const deleteChapter = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const deletedChapter = await Chapter.findByIdAndDelete(id);

    if (!deletedChapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    return res.status(200).json({ message: "Chapter deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting chapter:", error);
    return res.status(500).json({
      error: "Error deleting chapter",
      message: error.message,
    });
  }
};
