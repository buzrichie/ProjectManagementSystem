import { Schema, model, Document, Types } from "mongoose";

// Define the interface for the Chapter model
export interface IChapter extends Document {
  _id: Schema.Types.ObjectId;
  documentationId: Types.ObjectId;
  name:
    | "Introduction"
    | "Literature Review"
    | "Methodology"
    | "Results and Analysis"
    | "Conclusion";
  description?: string;
  fileUrl: string;
  status: string;
  feedback?: string;
  version: number;
  submissionDate: Date;
}

const ChapterSchema = new Schema<IChapter>({
  documentationId: {
    type: Schema.Types.ObjectId,
    ref: "Documentation",
    required: true,
  },
  name: {
    type: String,
    required: true,
    enum: [
      "Introduction",
      "Literature Review",
      "Methodology",
      "Results and Analysis",
      "Conclusion",
    ],
  },
  description: { type: String },
  fileUrl: { type: String },
  status: { type: String, default: "Pending" },
  feedback: { type: String },
  version: { type: Number, default: 1 },
  submissionDate: { type: Date, default: Date.now },
});

export const Chapter = model<IChapter>("Chapter", ChapterSchema);
