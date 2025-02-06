import { Schema, model } from 'mongoose';
import { IDocumentVersion } from '../interfaces/document.interface';

const documentVersionSchema = new Schema<IDocumentVersion>(
  {
    documentId: {
      type: String,
      required: true,
      ref: 'Document'
    },
    version: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    changes: [{
      type: {
        type: String,
        enum: ['added', 'modified', 'deleted'],
        required: true
      },
      path: {
        type: String,
        required: true
      },
      before: Schema.Types.Mixed,
      after: Schema.Types.Mixed
    }],
    comment: String,
    createdBy: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// 索引
documentVersionSchema.index({ documentId: 1, version: -1 });
documentVersionSchema.index({ createdAt: -1 });

export const DocumentVersionModel = model<IDocumentVersion>('DocumentVersion', documentVersionSchema); 