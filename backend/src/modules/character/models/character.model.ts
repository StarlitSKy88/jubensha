import { Schema, model, Document, Types } from 'mongoose';

export enum CharacterType {
  PLAYER = 'player',    // 玩家角色
  NPC = 'npc',         // NPC角色
  SUSPECT = 'suspect'  // 嫌疑人
}

export enum CharacterStatus {
  ACTIVE = 'active',     // 活跃
  INACTIVE = 'inactive', // 非活跃
  DEAD = 'dead'         // 死亡
}

export interface ICharacter extends Document {
  name: string;
  type: CharacterType;
  status: CharacterStatus;
  description: string;
  background: string;
  clues: Types.ObjectId[];        // 持有的线索
  relationships: {        // 与其他角色的关系
    character: Types.ObjectId;    // 关联的角色ID
    type: string;        // 关系类型
    description: string; // 关系描述
  }[];
  scriptId: Types.ObjectId;      // 所属剧本ID
  metadata: {
    version: number;
    createdAt: Date;
    updatedAt: Date;
  };
  projectId: Types.ObjectId;
  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
  isPublic: boolean;     // 是否公开
  creator: Types.ObjectId;  // 创建者
  imageUrl?: string;     // 角色图片URL
}

const CharacterSchema = new Schema<ICharacter>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },
    type: {
      type: String,
      enum: Object.values(CharacterType),
      required: true
    },
    status: {
      type: String,
      enum: Object.values(CharacterStatus),
      default: CharacterStatus.ACTIVE
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    background: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },
    clues: [{
      type: Schema.Types.ObjectId,
      ref: 'Clue'
    }],
    relationships: [{
      character: {
        type: Schema.Types.ObjectId,
        ref: 'Character',
        required: true
      },
      type: {
        type: String,
        required: true,
        trim: true
      },
      description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
      }
    }],
    scriptId: {
      type: Schema.Types.ObjectId,
      ref: 'Script',
      required: true
    },
    metadata: {
      version: {
        type: Number,
        default: 1
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
    },
    isPublic: {
      type: Boolean,
      default: false
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    imageUrl: {
      type: String,
      trim: true
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
CharacterSchema.index({ scriptId: 1, type: 1 });
CharacterSchema.index({ name: 'text', description: 'text' });

// 更新时自动更新版本号
CharacterSchema.pre('save', function(this: ICharacter, next) {
  if (this.isModified('description') || this.isModified('background')) {
    this.metadata.version += 1;
    this.metadata.updatedAt = new Date();
  }
  next();
});

export const Character = model<ICharacter>('Character', CharacterSchema); 