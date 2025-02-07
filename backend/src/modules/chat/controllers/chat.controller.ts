import { Request, Response, NextFunction } from 'express';
import { ChatService } from '../services/chat.service';
import { validateZod } from '@middlewares/validate.middleware';
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

export class ChatController {
  private chatService: ChatService;

  constructor() {
    this.chatService = new ChatService();
  }

  async createSession(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, projectId, context } = req.body;
      const session = await this.chatService.createSession({
        title,
        projectId,
        createdBy: req.user.id,
        context
      });

      res.status(201).json({
        success: true,
        data: session
      });
    } catch (error) {
      next(error);
    }
  }

  async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const { sessionId, content, type, context } = req.body;
      const message = await this.chatService.sendMessage({
        sessionId,
        content,
        type,
        createdBy: req.user.id,
        context
      });

      res.status(201).json({
        success: true,
        data: message
      });
    } catch (error) {
      next(error);
    }
  }

  async getSessionMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const { sessionId } = req.params;
      const { limit, before, type } = req.query;

      const messages = await this.chatService.getSessionMessages(sessionId, {
        limit: limit ? parseInt(limit as string) : undefined,
        before: before as string,
        type: type as any
      });

      res.json({
        success: true,
        data: messages
      });
    } catch (error) {
      next(error);
    }
  }

  async listSessions(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId, status, limit, page } = req.query;

      const result = await this.chatService.listSessions(projectId as string, {
        status: status as string,
        limit: limit ? parseInt(limit as string) : undefined,
        page: page ? parseInt(page as string) : undefined
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async updateSession(req: Request, res: Response, next: NextFunction) {
    try {
      const { sessionId } = req.params;
      const { title, status, context } = req.body;

      const session = await this.chatService.updateSession(sessionId, {
        title,
        status,
        context
      });

      res.json({
        success: true,
        data: session
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteSession(req: Request, res: Response, next: NextFunction) {
    try {
      const { sessionId } = req.params;
      await this.chatService.deleteSession(sessionId);

      res.json({
        success: true,
        message: '会话已删除'
      });
    } catch (error) {
      next(error);
    }
  }

  async regenerateMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const { messageId } = req.params;
      const message = await this.chatService.regenerateMessage(messageId);

      res.json({
        success: true,
        data: message
      });
    } catch (error) {
      next(error);
    }
  }

  async getSessionStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const { startDate, endDate } = req.query;

      const stats = await this.chatService.getSessionStats(projectId, {
        startDate: startDate as string,
        endDate: endDate as string
      });

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
} 