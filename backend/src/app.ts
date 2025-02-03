import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import morgan from 'morgan'
import { config } from './config'

// 导入路由
import { authRoutes } from './modules/auth/routes/auth.routes'
import { characterRoutes } from './modules/character/routes/character.routes'
import { timelineRoutes } from './modules/timeline/routes/timeline.routes'
import { knowledgeRoutes } from './modules/rag/routes/knowledge.routes'

// 创建 Express 应用
const app = express()

// 中间件
app.use(cors({
  origin: config.cors.origin,
  methods: config.cors.methods
}))
app.use(morgan(config.server.env === 'development' ? 'dev' : 'combined'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 静态文件
app.use('/uploads', express.static('uploads'))

// 路由
app.use('/api/auth', authRoutes)
app.use('/api/characters', characterRoutes)
app.use('/api/timeline', timelineRoutes)
app.use('/api/knowledge', knowledgeRoutes)

// 错误处理中间件
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err)
  
  const statusCode = err.statusCode || 500
  const message = err.message || '服务器内部错误'
  
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(config.server.env === 'development' && { stack: err.stack })
    }
  })
})

// MongoDB 连接选项
const mongooseOptions = {
  autoIndex: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
  retryWrites: true,
  retryReads: true
}

// 连接数据库
async function connectDB(retries = 5, interval = 5000) {
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(config.mongodb.uri, mongooseOptions)
      console.log('MongoDB 连接成功')
      return true
    } catch (error: any) {
      console.error(`MongoDB 连接失败 (尝试 ${i + 1}/${retries}):`, error.message)
      if (i < retries - 1) {
        console.log(`${interval / 1000} 秒后重试...`)
        await new Promise(resolve => setTimeout(resolve, interval))
      }
    }
  }
  return false
}

// 启动服务器
async function startServer() {
  try {
    const dbConnected = await connectDB()
    if (!dbConnected) {
      console.error('MongoDB 连接失败，服务器启动终止')
      process.exit(1)
    }

    const PORT = config.server.port
    app.listen(PORT, () => {
      console.log(`服务器运行在 http://localhost:${PORT}`)
      console.log(`环境: ${config.server.env}`)
    })
  } catch (error) {
    console.error('服务器启动失败:', error)
    process.exit(1)
  }
}

// 启动应用
startServer()

// 处理未捕获的异常
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的 Promise 拒绝:', reason)
})

process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error)
  // 给进程一些时间来处理剩余的请求
  setTimeout(() => {
    process.exit(1)
  }, 1000)
})

export default app 