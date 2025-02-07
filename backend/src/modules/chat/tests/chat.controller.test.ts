import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ChatController } from '../controllers/chat.controller';
import { ChatService } from '../services/chat.service';
import { Message, Session, MessageType, SessionStatus } from '../models/chat.model';
import { Request, Response, NextFunction } from 'express';

jest.mock('../services/chat.service');

describe('Chat Controller Test', () => {
  let mongoServer: MongoMemoryServer;
  let chatController: ChatController;
  let mockChatService: jest.Mocked<ChatService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock<NextFunction>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnThis();
    mockNext = jest.fn();
    mockResponse = {
      json: mockJson,
      status: mockStatus
    };
    mockChatService = new ChatService() as jest.Mocked<ChatService>;
    chatController = new ChatController();
    chatController['chatService'] = mockChatService;
  });

  describe('Session Management', () => {
    it('should create a new session', async () => {
      const userId = new mongoose.Types.ObjectId();
      const projectId = new mongoose.Types.ObjectId();
      const sessionData = {
        title: 'Test Session',
        projectId: projectId.toString(),
        createdBy: userId.toString()
      };

      mockRequest = {
        body: sessionData
      };

      const mockSession = {
        _id: new mongoose.Types.ObjectId(),
        ...sessionData,
        status: SessionStatus.ACTIVE,
        metadata: {
          messageCount: 0,
          lastMessageAt: new Date()
        }
      };

      mockChatService.createSession = jest.fn().mockResolvedValue(mockSession);

      await chatController.createSession(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockChatService.createSession).toHaveBeenCalledWith(sessionData);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockSession
      });
    });

    it('should list sessions', async () => {
      const projectId = new mongoose.Types.ObjectId().toString();
      mockRequest = {
        query: {
          projectId,
          page: '1',
          limit: '10'
        }
      };

      const mockResult = {
        sessions: [],
        total: 0,
        page: 1,
        pages: 1
      };

      mockChatService.listSessions = jest.fn().mockResolvedValue(mockResult);

      await chatController.listSessions(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockChatService.listSessions).toHaveBeenCalledWith(projectId, {
        page: 1,
        limit: 10
      });
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockResult
      });
    });
  });

  describe('Message Management', () => {
    it('should send a message', async () => {
      const userId = new mongoose.Types.ObjectId();
      const sessionId = new mongoose.Types.ObjectId();
      const messageData = {
        sessionId: sessionId.toString(),
        content: 'Test message',
        type: MessageType.TEXT,
        createdBy: userId.toString()
      };

      mockRequest = {
        body: messageData
      };

      const mockMessage = {
        _id: new mongoose.Types.ObjectId(),
        ...messageData,
        metadata: {
          tokens: 10
        }
      };

      mockChatService.sendMessage = jest.fn().mockResolvedValue(mockMessage);

      await chatController.sendMessage(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockChatService.sendMessage).toHaveBeenCalledWith(messageData);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockMessage
      });
    });

    it('should get session messages', async () => {
      const sessionId = new mongoose.Types.ObjectId().toString();
      mockRequest = {
        params: { sessionId },
        query: {
          limit: '20',
          before: new Date().toISOString()
        }
      };

      const mockMessages = [
        {
          _id: new mongoose.Types.ObjectId(),
          content: 'Test message',
          type: MessageType.TEXT
        }
      ];

      mockChatService.getSessionMessages = jest.fn().mockResolvedValue(mockMessages);

      await chatController.getSessionMessages(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockChatService.getSessionMessages).toHaveBeenCalledWith(sessionId, {
        limit: 20,
        before: expect.any(String)
      });
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockMessages
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle validation errors', async () => {
      const error = new Error('Validation failed');
      mockChatService.createSession = jest.fn().mockRejectedValue(error);

      mockRequest = {
        body: {}
      };

      await chatController.createSession(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Validation failed'
      });
    });

    it('should handle not found errors', async () => {
      const error = new Error('Session not found');
      mockChatService.getSessionMessages = jest.fn().mockRejectedValue(error);

      mockRequest = {
        params: { sessionId: 'invalid-id' }
      };

      await chatController.getSessionMessages(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Session not found'
      });
    });
  });
}); 