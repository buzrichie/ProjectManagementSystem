import { Schema, model, Document, Types } from "mongoose";
import { IChapter } from "./ChapterModel";

// Define the interface for chapters stored in the documentation
interface ChapterSummary {
  chapterId: Schema.Types.ObjectId;
  chapterName?: string;
  status?: string;
}

// Define the interface for the Documentation model
export interface IDocumentation extends Document {
  projectId: Types.ObjectId;
  groupId: Types.ObjectId;
  chapters: (IChapter | IChapter["_id"])[];
  finalDocument?: {
    fileUrl: string;
    status: string;
    submissionDate: Date;
  };
}

const DocumentationSchema = new Schema<IDocumentation>({
  projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
  groupId: { type: Schema.Types.ObjectId, ref: "Group", required: true },
  chapters: [
    {
      type: Schema.Types.ObjectId,
      ref: "Chapter",
    },
  ],
  // chapterId: {
  //   },
  //   chapterName: { type: String, required: true },
  //   status: { type: String, default: "Pending" },
  // },

  finalDocument: {
    fileUrl: { type: String },
    status: { type: String, default: "Pending Approval" },
    submissionDate: { type: Date },
  },
});

export const Documentation = model<IDocumentation>(
  "Documentation",
  DocumentationSchema
);
