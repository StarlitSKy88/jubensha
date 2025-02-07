import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ChatService } from '../services/chat.service';
import { Message, Session, MessageType, MessageRole, MessageStatus, SessionStatus } from '../models/chat.model';
import { OpenAI } from 'openai';
import { Redis } from '@utils/redis';
import { RAGService } from '../../rag/services/rag.service';

jest.mock('openai');
jest.mock('@utils/redis');
jest.mock('@modules/rag/services/rag.service');

describe('Chat Service Test', () => {
  let mongoServer: MongoMemoryServer;
  let chatService: ChatService;
  let mockOpenAI: jest.Mocked<OpenAI>;
  let mockRedis: jest.Mocked<Redis>;
  let mockRAGService: jest.Mocked<RAGService>;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(() => {
    mockOpenAI = new OpenAI() as jest.Mocked<OpenAI>;
    mockRedis = new Redis() as jest.Mocked<Redis>;
    mockRAGService = new RAGService() as jest.Mocked<RAGService>;
    chatService = new ChatService();
    chatService['openai'] = mockOpenAI;
    chatService['redis'] = mockRedis;
    chatService['ragService'] = mockRAGService;
  });

  afterEach(async () => {
    await Message.deleteMany({});
    await Session.deleteMany({});
    jest.clearAllMocks();
  });

  describe('Session Management', () => {
    it('should create a new session', async () => {
      const sessionData = {
        title: 'Test Session',
        projectId: new mongoose.Types.ObjectId().toString(),
        createdBy: new mongoose.Types.ObjectId().toString()
      };

      const session = await chatService.createSession(sessionData);

      expect(session).toBeDefined();
      expect(session.title).toBe(sessionData.title);
      expect(session.status).toBe(SessionStatus.ACTIVE);
      expect(session.metadata.messageCount).toBe(0);
    });

    it('should list sessions', async () => {
      const projectId = new mongoose.Types.ObjectId().toString();
      const userId = new mongoose.Types.ObjectId().toString();

      // 创建测试会话
      await Promise.all([
        chatService.createSession({
          title: 'Session 1',
          projectId,
          createdBy: userId
        }),
        chatService.createSession({
          title: 'Session 2',
          projectId,
          createdBy: userId
        })
      ]);

      const result = await chatService.listSessions(projectId);

      expect(result.sessions).toHaveLength(2);
      expect(result.total).toBe(2);
    });
  });

  describe('Message Management', () => {
    it('should send a text message', async () => {
      const session = await chatService.createSession({
        title: 'Test Session',
        projectId: new mongoose.Types.ObjectId().toString(),
        createdBy: new mongoose.Types.ObjectId().toString()
      });

      const messageData = {
        sessionId: session._id.toString(),
        content: 'Test message',
        type: MessageType.TEXT,
        createdBy: new mongoose.Types.ObjectId().toString()
      };

      mockOpenAI.chat.completions.create = jest.fn().mockResolvedValue({
        choices: [{ message: { content: 'AI response' } }]
      } as any);

      const message = await chatService.sendMessage(messageData);

      expect(message).toBeDefined();
      expect(message.content).toBe(messageData.content);
      expect(message.type).toBe(messageData.type);
      expect(message.status).toBe(MessageStatus.COMPLETED);
    });

    it('should handle message regeneration', async () => {
      const session = await chatService.createSession({
        title: 'Test Session',
        projectId: new mongoose.Types.ObjectId().toString(),
        createdBy: new mongoose.Types.ObjectId().toString()
      });

      const originalMessage = await chatService.sendMessage({
        sessionId: session._id.toString(),
        content: 'Original message',
        type: MessageType.TEXT,
        createdBy: new mongoose.Types.ObjectId().toString()
      });

      mockOpenAI.chat.completions.create = jest.fn().mockResolvedValue({
        choices: [{ message: { content: 'Regenerated response' } }]
      } as any);

      const regeneratedMessage = await chatService.regenerateMessage(originalMessage._id.toString());

      expect(regeneratedMessage).toBeDefined();
      expect(regeneratedMessage._id).not.toBe(originalMessage._id);
      expect(regeneratedMessage.content).toBe('Regenerated response');
      expect(regeneratedMessage.status).toBe(MessageStatus.COMPLETED);
    });
  });

  describe('Error Handling', () => {
    it('should handle session not found error', async () => {
      const invalidSessionId = new mongoose.Types.ObjectId().toString();

      await expect(
        chatService.sendMessage({
          sessionId: invalidSessionId,
          content: 'Test message',
          type: MessageType.TEXT,
          createdBy: new mongoose.Types.ObjectId().toString()
        })
      ).rejects.toThrow('Session not found');
    });

    it('should handle OpenAI API errors', async () => {
      const session = await chatService.createSession({
        title: 'Test Session',
        projectId: new mongoose.Types.ObjectId().toString(),
        createdBy: new mongoose.Types.ObjectId().toString()
      });

      mockOpenAI.chat.completions.create = jest.fn().mockRejectedValue(
        new Error('OpenAI API error')
      );

      const message = await chatService.sendMessage({
        sessionId: session._id.toString(),
        content: 'Test message',
        type: MessageType.TEXT,
        createdBy: new mongoose.Types.ObjectId().toString()
      });

      expect(message.status).toBe(MessageStatus.FAILED);
      expect(message.metadata.error).toBe('OpenAI API error');
    });
  });
}); 