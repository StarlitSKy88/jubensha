import { Schema, model, Document, Types } from 'mongoose';
import { z } from 'zod';

export enum DocumentType {
  SCRIPT = 'script',
  CHARACTER = 'character',
  PLOT = 'plot',
  TIMELINE = 'timeline',
  NOTE = 'note',
  OTHER = 'other'
}

export enum DocumentStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  DELETED = 'deleted'
}

export const DocumentSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string(),
  type: z.nativeEnum(DocumentType),
  tags: z.array(z.string()).default([]),
  status: z.nativeEnum(DocumentStatus),
  version: z.number().int().positive(),
  projectId: z.string(),
  parentId: z.string().optional(),
  createdBy: z.string(),
  updatedBy: z.string(),
  metadata: z.record(z.any()).optional(),
  permissions: z.array(z.enum(['read', 'write'])).default([])
});

export type DocumentData = z.infer<typeof DocumentSchema>;

export interface IDocument extends Document {
  title: string;
  content: string;
  type: DocumentType;
  tags: string[];
  status: DocumentStatus;
  version: number;
  projectId: Types.ObjectId;
  parentId?: Types.ObjectId;
  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
  metadata?: Record<string, any>;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new Schema<IDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 200
    },
    content: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true,
      enum: Object.values(DocumentType)
    },
    tags: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(DocumentStatus),
      default: DocumentStatus.DRAFT
    },
    version: {
      type: Number,
      required: true,
      default: 1
    },
    projectId: {
      type: Types.ObjectId,
      required: true,
      ref: 'Project'
    },
    parentId: {
      type: Types.ObjectId,
      ref: 'Document'
    },
    createdBy: {
      type: Types.ObjectId,
      required: true,
      ref: 'User'
    },
    updatedBy: {
      type: Types.ObjectId,
      required: true,
      ref: 'User'
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {}
    },
    permissions: {
      type: [String],
      enum: ['read', 'write'],
      default: []
    }
  },
  {
    timestamps: true
  }
);

// 创建索引
documentSchema.index({ projectId: 1 });
documentSchema.index({ type: 1 });
documentSchema.index({ tags: 1 });
documentSchema.index({ title: 'text' });
documentSchema.index({ parentId: 1 });
documentSchema.index({ createdBy: 1 });
documentSchema.index({ status: 1 });

export const DocumentModel = model<IDocument>('Document', documentSchema); 