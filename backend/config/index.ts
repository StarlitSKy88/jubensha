import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

interface Config {
  port: number;
  env: string;
  mongodb: {
    uri: string;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
  };
  elasticsearch: {
    node: string;
    auth: {
      username?: string;
      password?: string;
    };
  };
  milvus: {
    address: string;
    username?: string;
    password?: string;
    ssl?: boolean;
    collection: string;
    dimension: number;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  logger: {
    level: string;
    dir: string;
  };
}

export const config: Config = {
  // 服务器配置
  port: parseInt(process.env.PORT || '3000', 10),
  env: process.env.NODE_ENV || 'development',

  // 数据库配置
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/knowledge_base',
  },

  // JWT 配置
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  // Milvus 配置
  milvus: {
    address: process.env.MILVUS_ADDRESS || 'localhost:19530',
    username: process.env.MILVUS_USERNAME,
    password: process.env.MILVUS_PASSWORD,
    ssl: process.env.MILVUS_SSL === 'true',
    collection: process.env.MILVUS_COLLECTION || 'knowledge_vectors',
    dimension: parseInt(process.env.MILVUS_DIMENSION || '768', 10),
  },

  // Redis 配置
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
  },

  // Elasticsearch 配置
  elasticsearch: {
    node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
    auth: {
      username: process.env.ELASTICSEARCH_USERNAME,
      password: process.env.ELASTICSEARCH_PASSWORD,
    },
  },

  // 日志配置
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    dir: process.env.LOG_DIR || 'logs',
  },
}; 