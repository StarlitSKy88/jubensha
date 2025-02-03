import { Schema, model, Document, Types } from 'mongoose';

export enum KnowledgeType {
  CHARACTER = 'character',
  STORY = 'story',
  WORLD = 'world',
  RELATIONSHIP = 'relationship',
  EVENT = 'event',
  CUSTOM = 'custom'
}

export interface IKnowledge extends Document {
  title: string;
  content: string;
  type: KnowledgeType;
  tags: string[];
  embedding?: number[];
  metadata?: Record<string, any>;
  projectId: Types.ObjectId;
  creator: Types.ObjectId;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const knowledgeSchema = new Schema<IKnowledge>({
  title: {
    type: String,
    required: [true, '知识标题是必需的'],
    trim: true,
    minlength: [2, '知识标题至少需要2个字符'],
    maxlength: [100, '知识标题不能超过100个字符']
  },
  content: {
    type: String,
    required: [true, '知识内容是必需的'],
    trim: true,
    maxlength: [10000, '知识内容不能超过10000个字符']
  },
  type: {
    type: String,
    enum: Object.values(KnowledgeType),
    required: [true, '知识类型是必需的']
  },
  tags: [{
    type: String,
    trim: true
  }],
  embedding: [{
    type: Number
  }],
  metadata: {
    type: Map,
    of: Schema.Types.Mixed
  },
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// 索引优化
knowledgeSchema.index({ projectId: 1, type: 1 });
knowledgeSchema.index({ tags: 1 });
knowledgeSchema.index({ creator: 1 });
knowledgeSchema.index({ isPublic: 1 });
knowledgeSchema.index({ title: 'text', content: 'text' });

export const Knowledge = model<IKnowledge>('Knowledge', knowledgeSchema); 