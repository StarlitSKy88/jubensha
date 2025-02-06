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

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  
  // MongoDB配置
  mongodb: mongodbConfig,

  // JWT配置
  jwt: jwtConfig,

  // Redis配置
  redis: redisConfig,

  // 日志配置
  log: logConfig,

  // 跨域配置
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
  },

  // 限流配置
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 100 // 限制每个IP 15分钟内最多100个请求
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
  openai: openaiConfig,
  monitor: monitorConfig,
  bert: bertConfig
};

export default config; 