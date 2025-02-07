import { Schema, model, Document, Types } from 'mongoose';

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system'
}

export enum MessageType {
  TEXT = 'text',           
  SCRIPT_EDIT = 'script_edit',   
  CHARACTER_DESIGN = 'character_design',  
  PLOT_SUGGESTION = 'plot_suggestion',    
  CLUE_DESIGN = 'clue_design',    
  ERROR = 'error',          
  GENERAL = 'general'
}

export enum MessageStatus {
  PENDING = 'pending',     
  PROCESSING = 'processing', 
  COMPLETED = 'completed',   
  FAILED = 'failed'         
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
    tokens: number;       
    processingTime?: number;  
    error?: string;      
    context?: {         
      scriptId?: string;  
      characterId?: string;  
      clueId?: string;    
      selection?: {      
        start: number;
        end: number;
        text: string;
      };
    };
  };
  sessionId: Types.ObjectId;  
  projectId: Types.ObjectId;  
  createdBy: Types.ObjectId;  
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
    tokens: { type: Number, required: true },
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
    required: true 
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
    lastMessageAt: Date,
    context: Schema.Types.Mixed
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

export const Message = model<IMessage>('Message', MessageSchema);
export const Session = model<ISession>('Session', SessionSchema); 