import { Schema, model, Document } from 'mongoose';
import { z } from 'zod';

export enum KnowledgeTypeEnum {
  CHARACTER = 'character',
  PLOT = 'plot',
  CLUE = 'clue',
  DIALOGUE = 'dialogue',
  BACKGROUND = 'background',
  OTHER = 'other',
}

export const KnowledgeSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  type: z.nativeEnum(KnowledgeTypeEnum),
  category: z.string().min(1).max(50),
  summary: z.string().optional(),
  tags: z.array(z.string()).default([]),
  metadata: z.record(z.any()).optional(),
  visibility: z.enum(['public', 'private']).default('public'),
  status: z.enum(['active', 'archived', 'deleted']).default('active'),
  embedding: z.array(z.number()).optional(),
  projectId: z.string(),
  createdBy: z.string(),
  updatedBy: z.string(),
});

export type Knowledge = z.infer<typeof KnowledgeSchema>;

const knowledgeSchema = new Schema({
  title: { type: String, required: true, maxlength: 200 },
  content: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: Object.values(KnowledgeTypeEnum),
  },
  category: { type: String, required: true, maxlength: 50 },
  summary: String,
  tags: [String],
  metadata: Schema.Types.Mixed,
  visibility: { 
    type: String,
    enum: ['public', 'private'],
    default: 'public',
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'deleted'],
    default: 'active',
  },
  embedding: [Number],
  projectId: { type: Schema.Types.ObjectId, required: true, ref: 'Project' },
  createdBy: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
}, {
  timestamps: true,
  collection: 'knowledge',
});

// 索引
knowledgeSchema.index({ projectId: 1, type: 1 });
knowledgeSchema.index({ projectId: 1, category: 1 });
knowledgeSchema.index({ projectId: 1, tags: 1 });
knowledgeSchema.index({ title: 'text', content: 'text' });

export interface IKnowledge extends Document {
  title: string;
  content: string;
  type: KnowledgeTypeEnum;
  category: string;
  summary?: string;
  tags: string[];
  metadata?: Record<string, any>;
  visibility: 'public' | 'private';
  status: 'active' | 'archived' | 'deleted';
  embedding?: number[];
  projectId: string;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export const KnowledgeModel = model<IKnowledge>('Knowledge', knowledgeSchema); 