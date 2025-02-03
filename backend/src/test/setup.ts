import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { config } from '../config';

let mongoServer: MongoMemoryServer;

// 连接到内存数据库
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

// 清理数据库
beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

// 断开连接并关闭服务器
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// 设置测试环境变量
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_EXPIRES_IN = '1h';

// 禁用日志输出
jest.mock('../utils/logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    success: jest.fn(),
    fail: jest.fn(),
    api: jest.fn(),
    db: jest.fn(),
    cache: jest.fn(),
    auth: jest.fn()
  }
})); 