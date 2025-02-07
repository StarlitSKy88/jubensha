import dotenv from 'dotenv';
import { serverConfig } from './server.config';
import { jwtConfig } from './jwt.config';
import { logConfig } from './log.config';
import { redisConfig } from './redis.config';
import { mongodbConfig } from './mongodb.config';
import { milvusConfig } from './milvus.config';
import { elasticsearchConfig } from './elasticsearch.config';
import { openaiConfig } from './openai.config';
import { uploadConfig } from './upload.config';
import { monitorConfig } from './monitor.config';
import { bertConfig } from './bert.config';

// 加载环境变量
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  
  // MongoDB配置
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/jubensha',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    }
  },

  // JWT配置
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },

  // Redis配置
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0', 10)
  },

  // 日志配置
  log: {
    level: process.env.LOG_LEVEL || 'info',
    filename: process.env.LOG_FILENAME || 'app.log'
  },

  // 跨域配置
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },

  // 限流配置
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15分钟
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10) // 每个IP最多100个请求
  },

  // 文件上传配置
  upload: uploadConfig,

  // 缓存配置
  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '3600', 10) // 1小时
  },

  // 邮件配置
  mail: {
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT || '587', 10),
    secure: process.env.MAIL_SECURE === 'true',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    },
    from: process.env.MAIL_FROM || 'noreply@example.com'
  },

  server: serverConfig,
  milvus: milvusConfig,
  elasticsearch: elasticsearchConfig,
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '4000', 10),
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
    topP: parseFloat(process.env.OPENAI_TOP_P || '1.0'),
    presencePenalty: parseFloat(process.env.OPENAI_PRESENCE_PENALTY || '0.0'),
    frequencyPenalty: parseFloat(process.env.OPENAI_FREQUENCY_PENALTY || '0.0')
  },
  monitor: monitorConfig,
  bert: bertConfig
};

export default config; 