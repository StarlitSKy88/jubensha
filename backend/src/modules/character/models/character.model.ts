import { Schema, model, Document, Types } from 'mongoose';

export interface ICharacter extends Document {
  name: string;
  description: string;
  age?: number;
  gender?: string;
  occupation?: string;
  background?: string;
  personality?: string;
  appearance?: string;
  relationships?: Array<{
    character: Types.ObjectId;
    type: string;
    description: string;
  }>;
  tags: string[];
  imageUrl?: string;
  creator: Types.ObjectId;
  projectId: Types.ObjectId;
  isPublic: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const characterSchema = new Schema<ICharacter>({
  name: {
    type: String,
    required: [true, '角色名称是必需的'],
    trim: true,
    minlength: [2, '角色名称至少需要2个字符'],
    maxlength: [50, '角色名称不能超过50个字符']
  },
  description: {
    type: String,
    required: [true, '角色描述是必需的'],
    trim: true,
    maxlength: [2000, '角色描述不能超过2000个字符']
  },
  age: {
    type: Number,
    min: [0, '年龄不能小于0'],
    max: [1000, '年龄不能超过1000']
  },
  gender: {
    type: String,
    trim: true,
    maxlength: [20, '性别描述不能超过20个字符']
  },
  occupation: {
    type: String,
    trim: true,
    maxlength: [100, '职业描述不能超过100个字符']
  },
  background: {
    type: String,
    trim: true,
    maxlength: [5000, '背景故事不能超过5000个字符']
  },
  personality: {
    type: String,
    trim: true,
    maxlength: [1000, '性格描述不能超过1000个字符']
  },
  appearance: {
    type: String,
    trim: true,
    maxlength: [1000, '外貌描述不能超过1000个字符']
  },
  relationships: [{
    character: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true
    },
    type: {
      type: String,
      required: true,
      trim: true,
      maxlength: [50, '关系类型不能超过50个字符']
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, '关系描述不能超过500个字符']
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  imageUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: '图片URL格式不正确'
    }
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  metadata: {
    type: Map,
    of: Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// 索引优化
characterSchema.index({ name: 'text', description: 'text' });
characterSchema.index({ tags: 1 });
characterSchema.index({ creator: 1 });
characterSchema.index({ isPublic: 1 });
characterSchema.index({ projectId: 1, name: 1 });

// 添加虚拟字段：年龄段
characterSchema.virtual('ageGroup').get(function(this: ICharacter) {
  if (!this.age) return '未知';
  if (this.age < 18) return '未成年';
  if (this.age < 30) return '青年';
  if (this.age < 50) return '中年';
  return '老年';
});

// 添加虚拟字段：关系数量
characterSchema.virtual('relationshipCount').get(function(this: ICharacter) {
  return this.relationships?.length || 0;
});

// 预处理：转换标签为小写
characterSchema.pre('save', function(next) {
  if (this.isModified('tags')) {
    this.tags = this.tags.map(tag => tag.toLowerCase());
  }
  next();
});

export const Character = model<ICharacter>('Character', characterSchema); 