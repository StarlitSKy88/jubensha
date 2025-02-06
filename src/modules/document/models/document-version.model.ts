import mongoose, { Schema, Document, Types } from 'mongoose';

// 变更记录接口
interface IChange {
  field: string;
  oldValue: unknown;
  newValue: unknown;
}

// 文档版本接口
export interface IDocumentVersion extends Document {
  documentId: Types.ObjectId;
  version: number;
  title: string;
  content: string;
  changes: IChange[];
  createdBy: Types.ObjectId;
  createdAt: Date;
}

// Mongoose Schema
const documentVersionSchema = new Schema<IDocumentVersion>(
  {
    documentId: {
      type: Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
    },
    version: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    changes: [{
      field: {
        type: String,
        required: true,
      },
      oldValue: Schema.Types.Mixed,
      newValue: Schema.Types.Mixed,
    }],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// 索引
documentVersionSchema.index({ documentId: 1, version: -1 });
documentVersionSchema.index({ createdAt: -1 });

export const DocumentVersionModel = mongoose.model<IDocumentVersion>('DocumentVersion', documentVersionSchema); 