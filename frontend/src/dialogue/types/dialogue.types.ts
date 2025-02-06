// 消息类型
export type MessageRole = 'user' | 'assistant' | 'system';

// 消息状态
export type MessageStatus = 'sending' | 'sent' | 'failed';

// 编辑操作类型
export type EditOperation = 'insert' | 'delete' | 'replace' | 'update';

// 文件引用
export interface FileReference {
  fileId: string;
  fileName: string;
  position?: {
    start: number;
    end: number;
  };
  content?: string;
}

// 消息内容
export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  status: MessageStatus;
  references?: FileReference[];
  metadata?: Record<string, any>;
}

// 编辑请求
export interface EditRequest {
  fileId: string;
  operation: EditOperation;
  position: {
    start: number;
    end: number;
  };
  content?: string;
  metadata?: Record<string, any>;
}

// 编辑结果
export interface EditResult {
  success: boolean;
  changes: {
    before: string;
    after: string;
  };
  metadata?: Record<string, any>;
}

// 对话上下文
export interface DialogueContext {
  currentFile?: FileReference;
  editHistory: EditRequest[];
  messageHistory: Message[];
  metadata?: Record<string, any>;
}

// 对话状态
export interface DialogueState {
  messages: Message[];
  context: DialogueContext;
  isLoading: boolean;
  error?: string;
}

// 对话设置
export interface DialogueSettings {
  autoScroll: boolean;
  showTimestamp: boolean;
  enablePreview: boolean;
  confirmEdit: boolean;
}

// 对话服务配置
export interface DialogueServiceConfig {
  apiEndpoint: string;
  wsEndpoint?: string;
  timeout?: number;
  retryCount?: number;
  batchSize?: number;
}

// 对话事件
export interface DialogueEvent {
  type: 'message' | 'edit' | 'error' | 'status';
  payload: any;
  timestamp: number;
}

// 对话响应
export interface DialogueResponse {
  messageId: string;
  content: string;
  suggestions?: string[];
  edits?: EditRequest[];
  metadata?: Record<string, any>;
} 