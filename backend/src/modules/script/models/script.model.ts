import { Schema, model, Document } from 'mongoose';

export enum ScriptStatus {
  DRAFT = 'draft',
  REVIEW = 'review',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

export enum ScriptDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  EXPERT = 'expert'
}

export interface IScript extends Document {
  title: string;
  description: string;
  content: string;
  status: ScriptStatus;
  difficulty: ScriptDifficulty;
  playerCount: {
    min: number;
    max: number;
  };
  duration: number; // 预计游戏时长(分钟)
  tags: string[];
  metadata: {
    version: number;
    author: string;
    createdAt: Date;
    updatedAt: Date;
    publishedAt?: Date;
    rating?: number;
    playCount?: number;
  };
  projectId: string;
  createdBy: string;
  updatedBy: string;
}

const ScriptSchema = new Schema<IScript>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    content: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: Object.values(ScriptStatus),
      default: ScriptStatus.DRAFT
    },
    difficulty: {
      type: String,
      enum: Object.values(ScriptDifficulty),
      required: true
    },
    playerCount: {
      min: {
        type: Number,
        required: true,
        min: 1
      },
      max: {
        type: Number,
        required: true,
        min: 1
      }
    },
    duration: {
      type: Number,
      required: true,
      min: 30
    },
    tags: [{
      type: String,
      trim: true
    }],
    metadata: {
      version: {
        type: Number,
        default: 1
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
      },
      publishedAt: {
        type: Date
      },
      rating: {
        type: Number,
        min: 0,
        max: 5
      },
      playCount: {
        type: Number,
        default: 0
      }
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
        return ret;
      }
    }
  }
);

// 索引
ScriptSchema.index({ projectId: 1, status: 1 });
ScriptSchema.index({ tags: 1 });
ScriptSchema.index({ title: 'text', description: 'text' });

// 更新时自动更新版本号
ScriptSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    this.metadata.version += 1;
    this.metadata.updatedAt = new Date();
  }
  next();
});

// 发布时更新publishedAt
ScriptSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === ScriptStatus.PUBLISHED) {
    this.metadata.publishedAt = new Date();
  }
  next();
});

// 虚拟字段
ScriptSchema.virtual('isNew').get(function() {
  const now = new Date();
  const createdAt = this.metadata.createdAt;
  const daysDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
  return daysDiff <= 7; // 7天内为新剧本
});

export const ScriptModel = model<IScript>('Script', ScriptSchema); 