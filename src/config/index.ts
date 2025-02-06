import dotenv from 'dotenv';
import { z } from 'zod';

// 加载环境变量
dotenv.config();

// 定义配置schema
const configSchema = z.object({
  // 服务器配置
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // MongoDB配置
  MONGODB_URI: z.string().default('mongodb://localhost:27017/jubensha'),

  // JWT配置
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // 文件上传配置
  UPLOAD_DIR: z.string().default('uploads'),
  MAX_FILE_SIZE: z.string().transform(val => parseInt(val)).default('5242880'),

  // 日志配置
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_FILE_PATH: z.string().default('logs/app.log'),

  // 跨域配置
  CORS_ORIGIN: z.string().default('http://localhost:3000')
});

// 验证环境变量
const config = configSchema.parse(process.env);

export default config; 