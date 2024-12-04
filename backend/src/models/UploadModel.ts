import mongoose, {
  Document as MongooseDocument,
  Schema,
  Model,
} from "mongoose";

export interface IImage extends MongooseDocument {
  user: Schema.Types.ObjectId;
  image: {
    data: Buffer;
    contentType: string;
  };
}

export interface IDocument extends MongooseDocument {
  user: Schema.Types.ObjectId;
  doc: {
    data: Buffer;
    contentType: string;
  };
}

const imageSchema = new Schema<IImage>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    image: {
      data: Buffer,
      contentType: { type: String, required: true },
    },
  },
  { timestamps: true }
);

const documentSchema = new Schema<IDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doc: {
      data: Buffer,
      contentType: { type: String, required: true },
    },
  },
  { timestamps: true }
);

export const Image: Model<IImage> = mongoose.model<IImage>(
  "Image",
  imageSchema
);
export const Document: Model<IDocument> = mongoose.model<IDocument>(
  "Document",
  documentSchema
);
