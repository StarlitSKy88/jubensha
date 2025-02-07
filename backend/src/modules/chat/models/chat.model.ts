import { Schema, model, Document, Types } from 'mongoose';

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system'
}

export enum MessageType {
  TEXT = 'text',           // 普通文本消息
  SCRIPT_EDIT = 'script_edit',   // 剧本编辑建议
  CHARACTER_DESIGN = 'character_design',  // 角色设计建议
  PLOT_SUGGESTION = 'plot_suggestion',    // 情节建议
  CLUE_DESIGN = 'clue_design',    // 线索设计
  ERROR = 'error',          // 错误消息
  GENERAL = 'general'
}

export enum MessageStatus {
  PENDING = 'pending',     // 等待处理
  PROCESSING = 'processing', // 处理中
  COMPLETED = 'completed',   // 已完成
  FAILED = 'failed'         // 失败
}

export enum SessionStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  DELETED = 'deleted'
}

export interface IMessage extends Document {
  role: MessageRole;
  type: MessageType;
  content: string;
  status: MessageStatus;
  metadata: {
    tokens: number;       // token数量
    processingTime?: number;  // 处理时间(ms)
    error?: string;      // 错误信息
    context?: {         // 上下文信息
      scriptId?: string;  // 关联的剧本ID
      characterId?: string;  // 关联的角色ID
      clueId?: string;    // 关联的线索ID
      selection?: {      // 选中的文本
        start: number;
        end: number;
        text: string;
      };
    };
  };
  sessionId: Types.ObjectId;  // 会话ID
  projectId: Types.ObjectId;  // 项目ID
  createdBy: Types.ObjectId;  // 创建者
  createdAt: Date;
  updatedAt: Date;
}

export interface ISession extends Document {
  title: string;
  status: SessionStatus;
  metadata: {
    messageCount: number;
    lastMessageAt: Date;
    context?: Record<string, any>;
  };
  projectId: Types.ObjectId;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  role: {
    type: String,
    enum: Object.values(MessageRole),
    required: true
  },
  type: {
    type: String,
    enum: Object.values(MessageType),
    required: true
  },
  content: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: Object.values(MessageStatus),
    default: MessageStatus.PENDING
  },
  metadata: {
    tokens: Number,
    processingTime: Number,
    error: String,
    context: {
      scriptId: String,
      characterId: String,
      clueId: String,
      selection: {
        start: Number,
        end: Number,
        text: String
      }
    }
  },
  sessionId: {
    type: Schema.Types.ObjectId,
    ref: 'Session',
    required: true
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
  }
}, {
  timestamps: true
});

const SessionSchema = new Schema<ISession>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: Object.values(SessionStatus),
    default: SessionStatus.ACTIVE
  },
  metadata: {
    messageCount: {
      type: Number,
      default: 0
    },
    lastMessageAt: {
      type: Date,
      default: Date.now
    },
    context: {
      type: Map,
      of: Schema.Types.Mixed
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
  }
}, {
  timestamps: true
});

// 索引
MessageSchema.index({ sessionId: 1, createdAt: -1 });
MessageSchema.index({ projectId: 1, type: 1 });
MessageSchema.index({ createdBy: 1, status: 1 });

SessionSchema.index({ projectId: 1, status: 1 });
SessionSchema.index({ createdBy: 1, status: 1 });
SessionSchema.index({ 'metadata.lastMessageAt': -1 });

export const MessageModel = model<IMessage>('Message', MessageSchema);
export const SessionModel = model<ISession>('Session', SessionSchema); 