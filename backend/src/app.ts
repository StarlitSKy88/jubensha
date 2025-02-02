import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import morgan from 'morgan'
import timelineRoutes from './routes/timeline.routes'
import characterRoutes from './routes/character.routes'
import authRoutes from './routes/auth.routes'
import { BusinessError } from './utils/errors'

export const createApp = async () => {
  // 创建 Express 应用
  const app = express()

  // 中间件
  app.use(cors())
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(morgan('dev'))

  // 静态文件
  app.use('/uploads', express.static('uploads'))

  // 路由
  app.use('/api/auth', authRoutes)
  app.use('/api/timeline', timelineRoutes)
  app.use('/api/characters', characterRoutes)

  // 错误处理中间件
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack)

    if (err instanceof BusinessError) {
      return res.status(err.status).json({
        code: err.code,
        message: err.message
      })
    }

    res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'development' ? err.message : '服务器内部错误'
    })
  })

  return app
}

// 数据库连接
const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/story_character_manager'
    await mongoose.connect(uri)
    console.log('数据库连接成功')
  } catch (error) {
    console.error('数据库连接失败:', error)
    process.exit(1)
  }
}

// 启动服务器
const startServer = async () => {
  try {
    await connectDB()
    const app = await createApp()
    const port = process.env.PORT || 3000
    app.listen(port, () => {
      console.log(`服务器运行在 http://localhost:${port}`)
    })
  } catch (error) {
    console.error('服务器启动失败:', error)
    process.exit(1)
  }
}

// 导出 app 实例（用于测试）
export const app = createApp()

// 如果直接运行此文件，则启动服务器
if (require.main === module) {
  startServer()
} 