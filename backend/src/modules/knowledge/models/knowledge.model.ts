import { Schema, Document, Types, model } from 'mongoose';

export interface IKnowledge extends Document {
  projectId: Types.ObjectId;
  title: string;
  content: string;
  summary?: string;
  tags: string[];
  category?: string;
  source?: string;
  references?: string[];
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  vector?: number[];
  metadata: {
    wordCount: number;
    readingTime: number;
    complexity: number;
    lastIndexed?: Date;
  };
  status: 'draft' | 'published' | 'archived';
  visibility: 'public' | 'private' | 'restricted';
  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
  publishedAt?: Date;
  archivedAt?: Date;
}

const KnowledgeSchema = new Schema<IKnowledge>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    content: {
      type: String,
      required: true
    },
    summary: {
      type: String,
      trim: true,
      maxlength: 500
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function(tags: string[]) {
          return tags.length <= 20; // 最多20个标签
        },
        message: '标签数量不能超过20个'
      }
    },
    category: {
      type: String,
      trim: true
    },
    source: {
      type: String,
      trim: true
    },
    references: {
      type: [String],
      default: []
    },
    attachments: [
      {
        name: {
          type: String,
          required: true
        },
        url: {
          type: String,
          required: true
        },
        type: {
          type: String,
          required: true
        },
        size: {
          type: Number,
          required: true
        }
      }
    ],
    vector: {
      type: [Number],
      select: false, // 默认不返回向量数据
      validate: {
        validator: function(vector: number[]) {
          return !vector || vector.length === 768; // BERT base 维度
        },
        message: '向量维度必须是768'
      }
    },
    metadata: {
      wordCount: {
        type: Number,
        required: true,
        default: 0
      },
      readingTime: {
        type: Number,
        required: true,
        default: 0
      },
      complexity: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
        max: 1
      },
      lastIndexed: Date
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft'
    },
    visibility: {
      type: String,
      enum: ['public', 'private', 'restricted'],
      default: 'private'
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
    },
    publishedAt: Date,
    archivedAt: Date
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        delete ret.__v;
        delete ret.vector; // 始终排除向量数据
        return ret;
      }
    }
  }
);

// 索引
KnowledgeSchema.index({ projectId: 1, title: 1 }, { unique: true });
KnowledgeSchema.index({ projectId: 1, tags: 1 });
KnowledgeSchema.index({ projectId: 1, category: 1 });
KnowledgeSchema.index({ projectId: 1, status: 1 });
KnowledgeSchema.index({ projectId: 1, visibility: 1 });
KnowledgeSchema.index({ projectId: 1, createdBy: 1 });
KnowledgeSchema.index({ 'metadata.lastIndexed': 1 });
KnowledgeSchema.index(
  { title: 'text', content: 'text', summary: 'text' },
  {
    weights: {
      title: 10,
      summary: 5,
      content: 1
    },
    name: 'TextIndex'
  }
);

// 中间件
KnowledgeSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    // 计算字数
    this.metadata.wordCount = this.content.length;
    
    // 计算阅读时间（假设每分钟阅读300字）
    this.metadata.readingTime = Math.ceil(this.metadata.wordCount / 300);
    
    // 计算复杂度（基于字数、标点符号等）
    const complexity = Math.min(this.content.length / 10000, 1); // 简单示例
    this.metadata.complexity = complexity;
  }
  
  // 更新状态相关时间戳
  if (this.isModified('status')) {
    if (this.status === 'published') {
      this.publishedAt = new Date();
    } else if (this.status === 'archived') {
      this.archivedAt = new Date();
    }
  }
  
  next();
});

// 虚拟字段
KnowledgeSchema.virtual('attachmentCount').get(function(this: IKnowledge) {
  return this.attachments?.length || 0;
});

KnowledgeSchema.virtual('referenceCount').get(function(this: IKnowledge) {
  return this.references?.length || 0;
});

KnowledgeSchema.virtual('tagCount').get(function(this: IKnowledge) {
  return this.tags?.length || 0;
});

export const Knowledge = model<IKnowledge>('Knowledge', KnowledgeSchema); 