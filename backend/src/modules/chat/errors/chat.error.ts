import { BaseError } from '@utils/errors';

export class ChatError extends BaseError {
  constructor(message: string) {
    super('CHAT_ERROR', message, 400);
  }
}

export class SessionNotFoundError extends BaseError {
  constructor(sessionId: string) {
    super('SESSION_NOT_FOUND', `会话 ${sessionId} 不存在`, 404);
  }
}

export class MessageNotFoundError extends BaseError {
  constructor(messageId: string) {
    super('MESSAGE_NOT_FOUND', `消息 ${messageId} 不存在`, 404);
  }
}

export class InvalidMessageTypeError extends BaseError {
  constructor(type: string) {
    super('INVALID_MESSAGE_TYPE', `无效的消息类型: ${type}`, 400);
  }
}

export class MessageProcessingError extends BaseError {
  constructor(message: string) {
    super('MESSAGE_PROCESSING_ERROR', `消息处理失败: ${message}`, 500);
  }
}

export class SessionLimitExceededError extends BaseError {
  constructor() {
    super('SESSION_LIMIT_EXCEEDED', '已达到会话数量限制', 400);
  }
}

export class MessageLimitExceededError extends BaseError {
  constructor() {
    super('MESSAGE_LIMIT_EXCEEDED', '已达到消息数量限制', 400);
  }
}

export class InvalidSessionStatusError extends BaseError {
  constructor(status: string) {
    super('INVALID_SESSION_STATUS', `无效的会话状态: ${status}`, 400);
  }
}

export class SessionArchiveError extends BaseError {
  constructor(sessionId: string) {
    super('SESSION_ARCHIVE_ERROR', `归档会话 ${sessionId} 失败`, 500);
  }
}

export class UnauthorizedSessionAccessError extends BaseError {
  constructor() {
    super('UNAUTHORIZED_SESSION_ACCESS', '无权访问该会话', 403);
  }
}

export class RateLimitExceededError extends BaseError {
  constructor() {
    super('RATE_LIMIT_EXCEEDED', '已超过消息发送频率限制', 429);
  }
} 