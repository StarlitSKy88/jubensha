import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ChatService } from '../services/chat.service';
import { Message, Session, MessageType, MessageRole, MessageStatus, SessionStatus } from '../models/chat.model';
import { UnauthorizedError, NotFoundError, ValidationError } from '@utils/errors';

describe('Chat Service Test', () => {
  let mongoServer: MongoMemoryServer;
  let chatService: ChatService;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    chatService = new ChatService();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await Message.deleteMany({});
    await Session.deleteMany({});
  });

  describe('Session Management', () => {
    it('should create a new session', async () => {
      const userId = new mongoose.Types.ObjectId();
      const projectId = new mongoose.Types.ObjectId();

      const session = await chatService.createSession({
        title: 'Test Session',
        projectId: projectId.toString(),
        createdBy: userId.toString()
      });

      expect(session._id).toBeDefined();
      expect(session.title).toBe('Test Session');
      expect(session.status).toBe(SessionStatus.ACTIVE);
      expect(session.projectId.toString()).toBe(projectId.toString());
      expect(session.createdBy.toString()).toBe(userId.toString());
      expect(session.metadata.messageCount).toBe(0);
    });

    it('should list sessions for a project', async () => {
      const projectId = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId();

      await Promise.all([
        chatService.createSession({
          title: 'Session 1',
          projectId: projectId.toString(),
          createdBy: userId.toString()
        }),
        chatService.createSession({
          title: 'Session 2',
          projectId: projectId.toString(),
          createdBy: userId.toString()
        })
      ]);

      const result = await chatService.listSessions(projectId.toString());

      expect(result.sessions.length).toBe(2);
      expect(result.total).toBe(2);
    });

    it('should update session details', async () => {
      const session = await chatService.createSession({
        title: '原始标题',
        projectId: new mongoose.Types.ObjectId().toString(),
        createdBy: new mongoose.Types.ObjectId().toString()
      });

      const updatedSession = await chatService.updateSession(session._id, {
        title: '更新后的标题',
        status: SessionStatus.ARCHIVED
      });

      expect(updatedSession.title).toBe('更新后的标题');
      expect(updatedSession.status).toBe(SessionStatus.ARCHIVED);
    });

    it('should delete a session', async () => {
      const session = await chatService.createSession({
        title: '待删除的会话',
        projectId: new mongoose.Types.ObjectId().toString(),
        createdBy: new mongoose.Types.ObjectId().toString()
      });

      await chatService.deleteSession(session._id);

      const deletedSession = await Session.findById(session._id);
      expect(deletedSession).toBeNull();
    });
  });

  describe('Message Management', () => {
    it('should send and receive messages', async () => {
      const userId = new mongoose.Types.ObjectId();
      const projectId = new mongoose.Types.ObjectId();

      const session = await chatService.createSession({
        title: 'Test Session',
        projectId: projectId.toString(),
        createdBy: userId.toString()
      });

      const message = await chatService.sendMessage({
        sessionId: session._id.toString(),
        content: 'Test message',
        type: MessageType.TEXT,
        createdBy: userId.toString()
      });

      expect(message._id).toBeDefined();
      expect(message.content).toBeDefined();
      expect(message.status).toBe(MessageStatus.COMPLETED);

      const messages = await chatService.getSessionMessages(session._id.toString());
      expect(messages.length).toBeGreaterThan(0);
    });

    it('should handle message regeneration', async () => {
      const userId = new mongoose.Types.ObjectId();
      const projectId = new mongoose.Types.ObjectId();

      const session = await chatService.createSession({
        title: 'Test Session',
        projectId: projectId.toString(),
        createdBy: userId.toString()
      });

      const originalMessage = await chatService.sendMessage({
        sessionId: session._id.toString(),
        content: 'Test message',
        type: MessageType.TEXT,
        createdBy: userId.toString()
      });

      const regeneratedMessage = await chatService.regenerateMessage(originalMessage._id.toString());

      expect(regeneratedMessage._id).toBeDefined();
      expect(regeneratedMessage.content).toBeDefined();
      expect(regeneratedMessage.status).toBe(MessageStatus.COMPLETED);
    });
  });

  describe('Error Handling', () => {
    it('should throw NotFoundError when session not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();

      await expect(
        chatService.getSessionMessages(nonExistentId, {})
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw ValidationError when sending message to archived session', async () => {
      const session = await chatService.createSession({
        title: '已归档会话',
        projectId: new mongoose.Types.ObjectId().toString(),
        createdBy: new mongoose.Types.ObjectId().toString()
      });

      await chatService.updateSession(session._id, {
        status: SessionStatus.ARCHIVED
      });

      await expect(
        chatService.sendMessage({
          sessionId: session._id,
          content: '测试消息',
          type: MessageType.SCRIPT_EDIT,
          createdBy: new mongoose.Types.ObjectId().toString()
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should throw UnauthorizedError when user not authorized', async () => {
      const session = await chatService.createSession({
        title: '测试会话',
        projectId: new mongoose.Types.ObjectId().toString(),
        createdBy: new mongoose.Types.ObjectId().toString()
      });

      const unauthorizedUserId = new mongoose.Types.ObjectId().toString();

      await expect(
        chatService.sendMessage({
          sessionId: session._id,
          content: '测试消息',
          type: MessageType.SCRIPT_EDIT,
          createdBy: unauthorizedUserId
        })
      ).rejects.toThrow(UnauthorizedError);
    });
  });
}); 