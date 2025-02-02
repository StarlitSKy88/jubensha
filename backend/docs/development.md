# 后端开发指南

## 开发环境配置

### 系统要求

- Node.js >= 16
- MongoDB >= 4.4
- Git

### 编辑器配置

推荐使用 VS Code，并安装以下插件：

- ESLint
- Prettier
- TypeScript Vue Plugin (Volar)
- MongoDB for VS Code
- Thunder Client

### 环境变量配置

1. 复制环境变量示例文件：
```bash
cp .env.example .env
```

2. 修改环境变量：
```env
# 服务器配置
PORT=3000
NODE_ENV=development

# MongoDB 配置
MONGODB_URI=mongodb://localhost:27017/story_character_manager

# JWT 配置
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# OpenAI 配置
OPENAI_API_KEY=your_openai_api_key

# 文件上传配置
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880 # 5MB

# 日志配置
LOG_LEVEL=debug
LOG_FORMAT=dev
```

## 项目结构

```
.
├── src/
│   ├── controllers/   # 控制器层：处理 HTTP 请求和响应
│   │   ├── character.controller.ts
│   │   └── timeline.controller.ts
│   ├── models/        # 数据模型层：定义数据结构和模式
│   │   ├── character.model.ts
│   │   └── timeline.model.ts
│   ├── services/      # 服务层：处理业务逻辑
│   │   ├── character.service.ts
│   │   └── timeline.service.ts
│   ├── routes/        # 路由层：定义 API 路由
│   │   ├── character.routes.ts
│   │   └── timeline.routes.ts
│   ├── middlewares/   # 中间件：处理通用功能
│   │   ├── auth.ts
│   │   └── upload.ts
│   ├── utils/         # 工具函数：通用辅助函数
│   │   ├── request.ts
│   │   └── format.ts
│   ├── types/         # 类型定义：TypeScript 类型
│   │   ├── character.ts
│   │   └── timeline.ts
│   └── __tests__/     # 测试文件
│       ├── controllers/
│       └── services/
├── uploads/          # 上传文件目录
└── docs/            # 文档目录
```

## 开发规范

### 代码风格

1. 使用 TypeScript 编写所有代码
2. 使用 ESLint + Prettier 进行代码格式化
3. 遵循 TypeScript 严格模式
4. 添加必要的注释和文档

### 命名规范

1. 文件名：kebab-case
   - character-controller.ts
   - timeline-service.ts

2. 类名：PascalCase
   - CharacterController
   - TimelineService

3. 变量和函数：camelCase
   - getCharacter
   - updateTimeline

4. 常量：UPPER_CASE
   - MAX_FILE_SIZE
   - DEFAULT_PAGE_SIZE

5. 接口和类型：PascalCase，接口以 I 开头
   - ICharacter
   - TimelineEvent

### Git 提交规范

1. 提交类型
   - feat: 新功能
   - fix: 修复问题
   - docs: 文档修改
   - style: 代码格式修改
   - refactor: 代码重构
   - test: 测试用例修改
   - chore: 其他修改

2. 提交格式
```
<type>(<scope>): <subject>

<body>

<footer>
```

示例：
```
feat(character): 添加角色分析功能

- 实现角色深度分析
- 添加一致性检查
- 集成 OpenAI API

Closes #123
```

## API 开发流程

1. 定义接口和类型
```typescript
// src/types/character.ts
export interface ICharacter {
  id: string
  name: string
  // ...其他属性
}
```

2. 创建数据模型
```typescript
// src/models/character.model.ts
import { Schema, model } from 'mongoose'
import { ICharacter } from '../types/character'

const characterSchema = new Schema<ICharacter>({
  // ...模型定义
})

export const Character = model<ICharacter>('Character', characterSchema)
```

3. 实现服务层
```typescript
// src/services/character.service.ts
export class CharacterService {
  async getCharacter(id: string): Promise<ICharacter | null> {
    // ...实现逻辑
  }
}
```

4. 创建控制器
```typescript
// src/controllers/character.controller.ts
export class CharacterController {
  async getCharacter(req: Request, res: Response) {
    // ...处理请求
  }
}
```

5. 定义路由
```typescript
// src/routes/character.routes.ts
const router = Router()
router.get('/:id', characterController.getCharacter)
```

6. 编写测试
```typescript
// src/__tests__/controllers/character.controller.test.ts
describe('CharacterController', () => {
  it('should get character by id', async () => {
    // ...测试代码
  })
})
```

## 测试规范

### 单元测试

1. 测试文件命名：*.test.ts 或 *.spec.ts
2. 使用 Jest 作为测试框架
3. 每个主要函数都应该有对应的测试
4. 测试应该独立且可重复
5. 使用 Mock 处理外部依赖

### 集成测试

1. 使用 Supertest 测试 API 接口
2. 使用 MongoDB Memory Server 进行数据库测试
3. 测试完整的请求-响应流程
4. 测试错误处理和边界情况

### 测试示例

```typescript
describe('CharacterController', () => {
  let app: Express
  let testCharacter: ICharacter

  beforeEach(async () => {
    // 设置测试环境
  })

  afterEach(async () => {
    // 清理测试数据
  })

  describe('GET /api/characters/:id', () => {
    it('should return character when exists', async () => {
      const res = await request(app)
        .get(`/api/characters/${testCharacter.id}`)
        .expect(200)

      expect(res.body.name).toBe(testCharacter.name)
    })

    it('should return 404 when character not found', async () => {
      await request(app)
        .get('/api/characters/non-existent-id')
        .expect(404)
    })
  })
})
```

## 错误处理

### 错误类型

1. 业务错误
```typescript
export class BusinessError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 400
  ) {
    super(message)
  }
}
```

2. 验证错误
```typescript
export class ValidationError extends BusinessError {
  constructor(message: string) {
    super('VALIDATION_ERROR', message, 400)
  }
}
```

3. 权限错误
```typescript
export class AuthorizationError extends BusinessError {
  constructor(message: string) {
    super('AUTHORIZATION_ERROR', message, 403)
  }
}
```

### 错误处理中间件

```typescript
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof BusinessError) {
    return res.status(err.status).json({
      code: err.code,
      message: err.message
    })
  }

  // 处理其他错误
  console.error(err)
  res.status(500).json({
    code: 'INTERNAL_ERROR',
    message: '服务器内部错误'
  })
}
```

## 性能优化

### 数据库优化

1. 索引优化
```typescript
characterSchema.index({ name: 1 })
characterSchema.index({ projectId: 1, createdAt: -1 })
```

2. 查询优化
```typescript
// 使用投影
Character.find({}, { name: 1, role: 1 })

// 使用 lean()
Character.find().lean()
```

### 缓存策略

1. 内存缓存
```typescript
import NodeCache from 'node-cache'

const cache = new NodeCache({ stdTTL: 600 })

async function getCharacterWithCache(id: string) {
  const cached = cache.get<ICharacter>(id)
  if (cached) return cached

  const character = await Character.findById(id)
  if (character) {
    cache.set(id, character)
  }
  return character
}
```

2. Redis 缓存
```typescript
import Redis from 'ioredis'

const redis = new Redis()

async function getCharacterWithRedis(id: string) {
  const cached = await redis.get(`character:${id}`)
  if (cached) return JSON.parse(cached)

  const character = await Character.findById(id)
  if (character) {
    await redis.setex(`character:${id}`, 3600, JSON.stringify(character))
  }
  return character
}
```

### 并发控制

1. 使用队列处理耗时任务
```typescript
import Queue from 'bull'

const analysisQueue = new Queue('character-analysis')

analysisQueue.process(async (job) => {
  const { characterId } = job.data
  // 处理分析任务
})

// 添加任务
await analysisQueue.add({ characterId })
```

2. 限制并发请求
```typescript
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
})

app.use('/api/', limiter)
```

## 安全措施

### 认证和授权

1. JWT 认证
```typescript
import jwt from 'jsonwebtoken'

export const generateToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN
  })
}

export const verifyToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET!)
}
```

2. 权限控制
```typescript
export const requirePermission = (permission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user
    if (!user.hasPermission(permission)) {
      throw new AuthorizationError('没有权限')
    }
    next()
  }
}
```

### 输入验证

1. 请求验证
```typescript
import { body, validationResult } from 'express-validator'

export const validateCreateCharacter = [
  body('name').notEmpty().trim(),
  body('role').isIn(['protagonist', 'antagonist', 'supporting']),
  
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw new ValidationError('请求参数错误')
    }
    next()
  }
]
```

2. 文件上传限制
```typescript
import multer from 'multer'

const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png']
    if (!allowedTypes.includes(file.mimetype)) {
      cb(new Error('不支持的文件类型'))
      return
    }
    cb(null, true)
  }
})
```

## 日志管理

### 日志配置

1. 使用 Winston 配置日志
```typescript
import winston from 'winston'

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }))
}
```

2. 请求日志
```typescript
import morgan from 'morgan'

app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}))
```

### 错误日志

```typescript
process.on('uncaughtException', (error) => {
  logger.error('未捕获的异常:', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  logger.error('未处理的 Promise 拒绝:', reason)
})
```

## 监控和告警

### 性能监控

1. 使用 Prometheus 和 Grafana
```typescript
import prometheus from 'prom-client'

const httpRequestDurationMicroseconds = new prometheus.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 5, 15, 50, 100, 200, 300, 400, 500]
})

app.use((req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    const duration = Date.now() - start
    httpRequestDurationMicroseconds
      .labels(req.method, req.route?.path || 'unknown', res.statusCode.toString())
      .observe(duration)
  })
  next()
})
```

2. 健康检查
```typescript
app.get('/health', async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping()
    res.json({ status: 'ok' })
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message })
  }
})
```

### 错误监控

1. 使用 Sentry
```typescript
import * as Sentry from '@sentry/node'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
})

app.use(Sentry.Handlers.requestHandler())
app.use(Sentry.Handlers.errorHandler())
```

2. 自定义错误报告
```typescript
const reportError = (error: Error, context: any = {}) => {
  Sentry.withScope(scope => {
    scope.setExtras(context)
    Sentry.captureException(error)
  })
}
```

## 部署指南

### 开发环境

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 生产环境

1. 准备工作
```bash
# 安装依赖
npm install --production

# 构建项目
npm run build
```

2. 使用 PM2 部署
```bash
# 安装 PM2
npm install -g pm2

# 启动服务
pm2 start ecosystem.config.js

# 查看日志
pm2 logs

# 监控
pm2 monit
```

3. ecosystem.config.js
```javascript
module.exports = {
  apps: [{
    name: 'story-character-manager',
    script: 'dist/app.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

## 常见问题

### 开发环境问题

1. 环境变量配置
```bash
# 检查 .env 文件
cat .env

# 检查环境变量是否生效
echo $NODE_ENV
```

2. 依赖安装问题
```bash
# 清理 npm 缓存
npm cache clean --force

# 删除 node_modules
rm -rf node_modules
npm install
```

### 运行时问题

1. 数据库连接
```typescript
mongoose.connection.on('error', (error) => {
  logger.error('MongoDB 连接错误:', error)
})

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB 连接断开')
})
```

2. 内存泄漏
```typescript
import memwatch from '@airbnb/node-memwatch'

memwatch.on('leak', (info) => {
  logger.warn('内存泄漏:', info)
})
```

## 参考资源

- [Express 文档](https://expressjs.com/)
- [Mongoose 文档](https://mongoosejs.com/)
- [TypeScript 文档](https://www.typescriptlang.org/)
- [Jest 文档](https://jestjs.io/)
- [OpenAI API 文档](https://platform.openai.com/docs/) 