import { z } from 'zod';
import { MessageType, MessageStatus, SessionStatus } from '../models/chat.model';

// 创建会话
export const createSessionSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(100),
    projectId: z.string().uuid(),
    context: z.object({}).optional()
  })
});

// 发送消息
export const sendMessageSchema = z.object({
  body: z.object({
    sessionId: z.string().uuid(),
    content: z.string().min(1),
    type: z.nativeEnum(MessageType),
    context: z.object({}).optional()
  })
});

// 获取会话消息
export const getSessionMessagesSchema = z.object({
  params: z.object({
    sessionId: z.string().uuid()
  }),
  query: z.object({
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    before: z.string().optional(),
    type: z.nativeEnum(MessageType).optional()
  })
});

// 获取会话列表
export const listSessionsSchema = z.object({
  query: z.object({
    projectId: z.string().uuid(),
    status: z.nativeEnum(SessionStatus).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional()
  })
});

// 更新会话
export const updateSessionSchema = z.object({
  params: z.object({
    sessionId: z.string().uuid()
  }),
  body: z.object({
    title: z.string().min(1).max(100).optional(),
    status: z.nativeEnum(SessionStatus).optional(),
    context: z.object({}).optional()
  })
});

// 删除会话
export const deleteSessionSchema = z.object({
  params: z.object({
    sessionId: z.string().uuid()
  })
});

// 重新生成消息
export const regenerateMessageSchema = z.object({
  params: z.object({
    messageId: z.string().uuid()
  })
});

// 获取会话统计
export const getSessionStatsSchema = z.object({
  params: z.object({
    projectId: z.string().uuid()
  }),
  query: z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
  })
}); 