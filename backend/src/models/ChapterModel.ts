import { Schema, model, Document, Types } from "mongoose";

// Define the interface for the Chapter model
interface Feedback {
  senderId: Schema.Types.ObjectId;
  message: string;
  createdAt: Date;
}
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
  feedback?: Feedback[];
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
  feedback: [
    {
      senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
      message: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  version: { type: Number, default: 1 },
  submissionDate: { type: Date, default: Date.now },
});

export const Chapter = model<IChapter>("Chapter", ChapterSchema);
