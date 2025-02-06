import { Schema, model, Document } from 'mongoose';

export enum KnowledgeType {
  PLOT_PATTERN = 'plot_pattern',
  CHARACTER_ARCHETYPE = 'character_archetype',
  STORY_STRUCTURE = 'story_structure',
  DIALOGUE_EXAMPLE = 'dialogue_example',
  CLUE_DESIGN = 'clue_design'
}

export interface IKnowledge extends Document {
  type: KnowledgeType;
  title: string;
  content: string;
  metadata: {
    category: string;
    tags: string[];
    source: string;
    author: string;
    createdAt: Date;
    updatedAt: Date;
  };
  embedding?: number[];
  version: number;
  status: 'active' | 'archived' | 'deleted';
  projectId: string;
  createdBy: string;
  updatedBy: string;
}

const KnowledgeSchema = new Schema<IKnowledge>(
  {
    type: {
      type: String,
      enum: Object.values(KnowledgeType),
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true
    },
    metadata: {
      category: {
        type: String,
        required: true
      },
      tags: [{
        type: String,
        trim: true
      }],
      source: {
        type: String,
        default: 'manual'
      },
      author: {
        type: String,
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      updatedAt: {
        type: Date,
        default: Date.now
      }
    },
    embedding: {
      type: [Number],
      select: false,
      sparse: true
    },
    version: {
      type: Number,
      default: 1
    },
    status: {
      type: String,
      enum: ['active', 'archived', 'deleted'],
      default: 'active'
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function(doc, ret) {
        delete ret._id;
        delete ret.__v;
        delete ret.embedding;
        return ret;
      }
    }
  }
);

// 索引
KnowledgeSchema.index({ projectId: 1, type: 1 });
KnowledgeSchema.index({ 'metadata.tags': 1 });
KnowledgeSchema.index({ title: 'text', content: 'text' });

// 更新时自动更新版本号
KnowledgeSchema.pre('save', function(next) {
  if (this.isModified('content') || this.isModified('metadata')) {
    this.version += 1;
    this.metadata.updatedAt = new Date();
  }
  next();
});

// 虚拟字段
KnowledgeSchema.virtual('isOutdated').get(function() {
  const now = new Date();
  const updatedAt = this.metadata.updatedAt;
  const monthsDiff = (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24 * 30);
  return monthsDiff > 6; // 6个月未更新则认为过时
});

export const KnowledgeModel = model<IKnowledge>('Knowledge', KnowledgeSchema); 