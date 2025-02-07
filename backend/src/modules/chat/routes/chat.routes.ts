import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';
import { validateZod } from '@middlewares/validate.middleware';
import { authenticate } from '@middlewares/auth.middleware';
import {
  createSessionSchema,
  sendMessageSchema,
  getSessionMessagesSchema,
  listSessionsSchema,
  updateSessionSchema,
  deleteSessionSchema,
  regenerateMessageSchema,
  getSessionStatsSchema
} from '../schemas/chat.schema';

const router = Router();
const chatController = new ChatController();

// 会话管理
router.post(
  '/sessions',
  authenticate,
  validateZod(createSessionSchema),
  chatController.createSession.bind(chatController)
);

router.get(
  '/sessions',
  authenticate,
  validateZod(listSessionsSchema),
  chatController.listSessions.bind(chatController)
);

router.patch(
  '/sessions/:sessionId',
  authenticate,
  validateZod(updateSessionSchema),
  chatController.updateSession.bind(chatController)
);

router.delete(
  '/sessions/:sessionId',
  authenticate,
  validateZod(deleteSessionSchema),
  chatController.deleteSession.bind(chatController)
);

// 消息管理
router.post(
  '/messages',
  authenticate,
  validateZod(sendMessageSchema),
  chatController.sendMessage.bind(chatController)
);

router.get(
  '/sessions/:sessionId/messages',
  authenticate,
  validateZod(getSessionMessagesSchema),
  chatController.getSessionMessages.bind(chatController)
);

router.post(
  '/messages/:messageId/regenerate',
  authenticate,
  validateZod(regenerateMessageSchema),
  chatController.regenerateMessage.bind(chatController)
);

// 统计信息
router.get(
  '/projects/:projectId/stats',
  authenticate,
  validateZod(getSessionStatsSchema),
  chatController.getSessionStats.bind(chatController)
);

export default router; 