import { Schema, model, Document, Types } from 'mongoose';
import { z } from 'zod';

export const DocumentVersionSchema = z.object({
  documentId: z.string(),
  version: z.number().int().positive(),
  title: z.string(),
  content: z.string(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  createdBy: z.string(),
  comment: z.string().optional(),
  changes: z.array(z.object({
    type: z.enum(['added', 'removed', 'modified']),
    path: z.string(),
    before: z.any().optional(),
    after: z.any().optional()
  })).optional()
});

export type DocumentVersionData = z.infer<typeof DocumentVersionSchema>;

export interface IDocumentVersion extends Document {
  documentId: Types.ObjectId;
  version: number;
  title: string;
  content: string;
  tags: string[];
  metadata?: Record<string, any>;
  createdBy: Types.ObjectId;
  comment?: string;
  changes?: Array<{
    type: 'added' | 'removed' | 'modified';
    path: string;
    before?: any;
    after?: any;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const documentVersionSchema = new Schema<IDocumentVersion>(
  {
    documentId: {
      type: Schema.Types.ObjectId,
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
    tags: {
      type: [String],
      default: []
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {}
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    comment: String,
    changes: [{
      type: {
        type: String,
        enum: ['added', 'removed', 'modified'],
        required: true
      },
      path: {
        type: String,
        required: true
      },
      before: Schema.Types.Mixed,
      after: Schema.Types.Mixed
    }]
  },
  {
    timestamps: true
  }
);

// 创建索引
documentVersionSchema.index({ documentId: 1, version: -1 });
documentVersionSchema.index({ createdBy: 1 });

export const DocumentVersionModel = model<IDocumentVersion>('DocumentVersion', documentVersionSchema); 