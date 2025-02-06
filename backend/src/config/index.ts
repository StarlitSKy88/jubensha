import { serverConfig } from './server.config';
import { jwtConfig } from './jwt.config';
import { logConfig } from './log.config';
import { redisConfig } from './redis.config';
import { mongodbConfig } from './mongodb.config';
import { milvusConfig } from './milvus.config';
import { bertConfig } from './bert.config';
import { elasticsearchConfig } from './elasticsearch.config';
import { openaiConfig } from './openai.config';
import { uploadConfig } from './upload.config';

export const config = {
  server: serverConfig,
  jwt: jwtConfig,
  log: logConfig,
  redis: redisConfig,
  mongodb: mongodbConfig,
  milvus: milvusConfig,
  bert: bertConfig,
  elasticsearch: elasticsearchConfig,
  openai: openaiConfig,
  upload: uploadConfig
} as const;

// 导出配置类型
export type Config = typeof config;

// 导出单个配置模块
export {
  serverConfig,
  jwtConfig,
  logConfig,
  redisConfig,
  mongodbConfig,
  milvusConfig,
  bertConfig,
  elasticsearchConfig,
  openaiConfig,
  uploadConfig
}; 