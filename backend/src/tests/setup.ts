import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

let mongoServer: MongoMemoryServer

beforeAll(async () => {
  // 创建内存数据库服务器
  mongoServer = await MongoMemoryServer.create()
  const mongoUri = mongoServer.getUri()

  // 连接到内存数据库
  await mongoose.connect(mongoUri)
})

afterAll(async () => {
  // 断开数据库连接
  await mongoose.disconnect()
  // 关闭内存数据库服务器
  await mongoServer.stop()
})

beforeEach(async () => {
  // 清空所有集合
  const collections = await mongoose.connection.db.collections()
  for (const collection of collections) {
    await collection.deleteMany({})
  }
}) 