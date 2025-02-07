import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Message, MessageRole, MessageType, MessageStatus } from '../models/chat.model';

describe('Message Model Test', () => {
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
    await Message.deleteMany({});
  });

  it('should create & save message successfully', async () => {
    const validMessage = new Message({
      role: MessageRole.USER,
      type: MessageType.TEXT,
      content: 'Test message',
      status: MessageStatus.COMPLETED,
      metadata: {
        tokens: 10
      },
      sessionId: new mongoose.Types.ObjectId(),
      projectId: new mongoose.Types.ObjectId(),
      createdBy: new mongoose.Types.ObjectId()
    });

    const savedMessage = await validMessage.save();
    
    expect(savedMessage._id).toBeDefined();
    expect(savedMessage.role).toBe(MessageRole.USER);
    expect(savedMessage.type).toBe(MessageType.TEXT);
    expect(savedMessage.content).toBe('Test message');
    expect(savedMessage.status).toBe(MessageStatus.COMPLETED);
    expect(savedMessage.metadata.tokens).toBe(10);
  });

  it('should fail to save message without required fields', async () => {
    const messageWithoutRequiredField = new Message({
      role: MessageRole.USER,
      type: MessageType.TEXT,
      content: 'Test message'
    });

    let err;
    try {
      await messageWithoutRequiredField.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
  });

  it('should fail to save message with invalid role', async () => {
    const messageWithInvalidRole = new Message({
      role: 'invalid_role',
      type: MessageType.TEXT,
      content: 'Test message',
      metadata: {
        tokens: 10
      },
      sessionId: new mongoose.Types.ObjectId(),
      projectId: new mongoose.Types.ObjectId(),
      createdBy: new mongoose.Types.ObjectId()
    });

    let err;
    try {
      await messageWithInvalidRole.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
  });

  it('should fail to save message with invalid type', async () => {
    const messageWithInvalidType = new Message({
      role: MessageRole.USER,
      type: 'invalid_type',
      content: '这是一条测试消息',
      sessionId: new mongoose.Types.ObjectId().toString(),
      projectId: new mongoose.Types.ObjectId().toString(),
      createdBy: new mongoose.Types.ObjectId().toString()
    });

    let err;
    try {
      await messageWithInvalidType.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.type).toBeDefined();
  });

  it('should successfully save message with metadata', async () => {
    const messageWithMetadata = new Message({
      role: MessageRole.USER,
      type: MessageType.SCRIPT_EDIT,
      content: '这是一条测试消息',
      status: MessageStatus.COMPLETED,
      metadata: {
        scriptId: new mongoose.Types.ObjectId().toString(),
        selection: {
          start: 0,
          end: 10,
          text: '选中的文本'
        }
      },
      sessionId: new mongoose.Types.ObjectId().toString(),
      projectId: new mongoose.Types.ObjectId().toString(),
      createdBy: new mongoose.Types.ObjectId().toString()
    });

    const savedMessage = await messageWithMetadata.save();
    
    expect(savedMessage.metadata).toBeDefined();
    expect(savedMessage.metadata.scriptId).toBeDefined();
    expect(savedMessage.metadata.selection).toBeDefined();
    expect(savedMessage.metadata.selection.text).toBe('选中的文本');
  });
}); 