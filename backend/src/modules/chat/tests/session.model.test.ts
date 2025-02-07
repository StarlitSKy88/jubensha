import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Session, SessionStatus } from '../models/chat.model';

describe('Session Model Test', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await Session.deleteMany({});
  });

  it('should create & save session successfully', async () => {
    const validSession = new Session({
      title: 'Test Session',
      status: SessionStatus.ACTIVE,
      metadata: {
        messageCount: 0,
        lastMessageAt: new Date()
      },
      projectId: new mongoose.Types.ObjectId(),
      createdBy: new mongoose.Types.ObjectId()
    });

    const savedSession = await validSession.save();
    
    expect(savedSession._id).toBeDefined();
    expect(savedSession.title).toBe('Test Session');
    expect(savedSession.status).toBe(SessionStatus.ACTIVE);
    expect(savedSession.metadata.messageCount).toBe(0);
    expect(savedSession.metadata.lastMessageAt).toBeDefined();
  });

  it('should fail to save session without required fields', async () => {
    const sessionWithoutRequiredField = new Session({
      title: 'Test Session'
    });

    let err;
    try {
      await sessionWithoutRequiredField.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
  });

  it('should fail to save session with invalid status', async () => {
    const sessionWithInvalidStatus = new Session({
      title: 'Test Session',
      status: 'invalid_status',
      metadata: {
        messageCount: 0,
        lastMessageAt: new Date()
      },
      projectId: new mongoose.Types.ObjectId(),
      createdBy: new mongoose.Types.ObjectId()
    });

    let err;
    try {
      await sessionWithInvalidStatus.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
  });

  it('should successfully update session title and status', async () => {
    const session = new Session({
      title: '测试会话',
      status: SessionStatus.ACTIVE,
      projectId: new mongoose.Types.ObjectId().toString(),
      createdBy: new mongoose.Types.ObjectId().toString()
    });

    await session.save();

    session.title = '更新后的会话标题';
    session.status = SessionStatus.ARCHIVED;
    const updatedSession = await session.save();

    expect(updatedSession.title).toBe('更新后的会话标题');
    expect(updatedSession.status).toBe(SessionStatus.ARCHIVED);
  });

  it('should successfully update message count', async () => {
    const session = new Session({
      title: '测试会话',
      status: SessionStatus.ACTIVE,
      projectId: new mongoose.Types.ObjectId().toString(),
      createdBy: new mongoose.Types.ObjectId().toString(),
      messageCount: 0
    });

    await session.save();

    session.messageCount += 1;
    session.lastMessageAt = new Date();
    const updatedSession = await session.save();

    expect(updatedSession.messageCount).toBe(1);
    expect(updatedSession.lastMessageAt).toBeDefined();
  });
}); 