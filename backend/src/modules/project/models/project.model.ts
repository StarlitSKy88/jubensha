import { Schema, Document, Types, model } from 'mongoose';

export interface IProject extends Document {
  name: string;
  description?: string;
  type: 'personal' | 'team' | 'organization';
  visibility: 'public' | 'private' | 'restricted';
  status: 'active' | 'archived' | 'suspended';
  owner: Types.ObjectId;
  members: Array<{
    userId: Types.ObjectId;
    role: 'owner' | 'admin' | 'editor' | 'viewer';
    permissions: string[];
    joinedAt: Date;
  }>;
  settings: {
    defaultVisibility: 'public' | 'private' | 'restricted';
    allowGuests: boolean;
    enableComments: boolean;
    enableVersioning: boolean;
    enableSharing: boolean;
    maxStorageSize: number; // 单位：MB
  };
  metadata: {
    knowledgeCount: number;
    memberCount: number;
    lastActivity: Date;
    storageUsed: number; // 单位：bytes
  };
  tags: string[];
  category?: string;
  icon?: string;
  cover?: string;
  archivedAt?: Date;
  suspendedAt?: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    type: {
      type: String,
      enum: ['personal', 'team', 'organization'],
      default: 'personal'
    },
    visibility: {
      type: String,
      enum: ['public', 'private', 'restricted'],
      default: 'private'
    },
    status: {
      type: String,
      enum: ['active', 'archived', 'suspended'],
      default: 'active'
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    members: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        role: {
          type: String,
          enum: ['owner', 'admin', 'editor', 'viewer'],
          required: true
        },
        permissions: {
          type: [String],
          default: []
        },
        joinedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    settings: {
      defaultVisibility: {
        type: String,
        enum: ['public', 'private', 'restricted'],
        default: 'private'
      },
      allowGuests: {
        type: Boolean,
        default: false
      },
      enableComments: {
        type: Boolean,
        default: true
      },
      enableVersioning: {
        type: Boolean,
        default: true
      },
      enableSharing: {
        type: Boolean,
        default: true
      },
      maxStorageSize: {
        type: Number,
        default: 1024 // 1GB
      }
    },
    metadata: {
      knowledgeCount: {
        type: Number,
        default: 0
      },
      memberCount: {
        type: Number,
        default: 1
      },
      lastActivity: {
        type: Date,
        default: Date.now
      },
      storageUsed: {
        type: Number,
        default: 0
      }
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
    icon: {
      type: String,
      trim: true
    },
    cover: {
      type: String,
      trim: true
    },
    archivedAt: Date,
    suspendedAt: Date
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        delete ret.__v;
        return ret;
      }
    }
  }
);

// 索引
ProjectSchema.index({ name: 1, owner: 1 }, { unique: true });
ProjectSchema.index({ owner: 1 });
ProjectSchema.index({ 'members.userId': 1 });
ProjectSchema.index({ type: 1 });
ProjectSchema.index({ visibility: 1 });
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ tags: 1 });
ProjectSchema.index({ category: 1 });
ProjectSchema.index({ 'metadata.lastActivity': -1 });

// 中间件
ProjectSchema.pre('save', function(next) {
  // 更新成员数量
  if (this.isModified('members')) {
    this.metadata.memberCount = this.members.length;
  }

  // 更新状态相关时间戳
  if (this.isModified('status')) {
    if (this.status === 'archived') {
      this.archivedAt = new Date();
    } else if (this.status === 'suspended') {
      this.suspendedAt = new Date();
    }
  }

  next();
});

// 虚拟字段
ProjectSchema.virtual('isPersonal').get(function(this: IProject) {
  return this.type === 'personal';
});

ProjectSchema.virtual('isActive').get(function(this: IProject) {
  return this.status === 'active';
});

ProjectSchema.virtual('isPublic').get(function(this: IProject) {
  return this.visibility === 'public';
});

ProjectSchema.virtual('storageUsedInMB').get(function(this: IProject) {
  return Math.round(this.metadata.storageUsed / (1024 * 1024) * 100) / 100;
});

ProjectSchema.virtual('storageUsedPercentage').get(function(this: IProject) {
  return Math.round(
    (this.metadata.storageUsed / (this.settings.maxStorageSize * 1024 * 1024)) * 100
  );
});

export const Project = model<IProject>('Project', ProjectSchema); 