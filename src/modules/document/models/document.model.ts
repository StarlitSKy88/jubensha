import mongoose, { Schema, Document } from 'mongoose';
import { z } from 'zod';

// 文档状态枚举
export enum DocumentStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

// 文档类型枚举
export enum DocumentType {
  SCRIPT = 'script',
  RULE = 'rule',
  NOTE = 'note',
}

// 文档模型接口
export interface IDocument extends Document {
  title: string;
  content: string;
  type: DocumentType;
  tags: string[];
  status: DocumentStatus;
  version: number;
  createdBy: Schema.Types.ObjectId;
  updatedBy: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Zod验证Schema
export const DocumentSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(100, '标题不能超过100个字符'),
  content: z.string().min(1, '内容不能为空'),
  type: z.nativeEnum(DocumentType),
  tags: z.array(z.string()),
  status: z.nativeEnum(DocumentStatus).default(DocumentStatus.DRAFT),
});

// Mongoose Schema
const documentSchema = new Schema<IDocument>(
  {
    title: {
      type: String,
      required: [true, '标题不能为空'],
      trim: true,
      maxlength: [100, '标题不能超过100个字符'],
    },
    content: {
      type: String,
      required: [true, '内容不能为空'],
    },
    type: {
      type: String,
      enum: Object.values(DocumentType),
      required: [true, '文档类型不能为空'],
    },
    tags: [{
      type: String,
      trim: true,
    }],
    status: {
      type: String,
      enum: Object.values(DocumentStatus),
      default: DocumentStatus.DRAFT,
    },
    version: {
      type: Number,
      default: 1,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
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
documentSchema.index({ title: 'text', content: 'text' });
documentSchema.index({ type: 1, status: 1 });
documentSchema.index({ tags: 1 });
documentSchema.index({ createdBy: 1 });
documentSchema.index({ updatedAt: -1 });

export const Document = mongoose.model<IDocument>('Document', documentSchema); 