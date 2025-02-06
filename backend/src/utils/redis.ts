import { createClient, RedisClientType } from 'redis';
import { config } from '@config/index';
import { logger } from './logger';

export class Redis {
  private client: RedisClientType;
  private isConnected: boolean = false;

  constructor() {
    this.client = createClient({
      url: `redis://${config.redis.host}:${config.redis.port}`,
      password: config.redis.password
    });

    this.client.on('error', (error) => {
      logger.error('Redis连接错误:', error);
      this.isConnected = false;
    });

    this.client.on('connect', () => {
      logger.info('Redis连接成功');
      this.isConnected = true;
    });

    this.connect();
  }

  private async connect() {
    try {
      if (!this.isConnected) {
        await this.client.connect();
      }
    } catch (error) {
      logger.error('Redis连接失败:', error);
      throw error;
    }
  }

  async set(key: string, value: string, options?: { EX?: number }): Promise<void> {
    try {
      await this.connect();
      if (options?.EX) {
        await this.client.setEx(key, options.EX, value);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      logger.error('Redis设置值失败:', error);
      throw error;
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      await this.connect();
      return this.client.get(key);
    } catch (error) {
      logger.error('Redis获取值失败:', error);
      throw error;
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.connect();
      await this.client.del(key);
    } catch (error) {
      logger.error('Redis删除值失败:', error);
      throw error;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.connect();
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Redis检查键存在失败:', error);
      throw error;
    }
  }

  async expire(key: string, seconds: number): Promise<void> {
    try {
      await this.connect();
      await this.client.expire(key, seconds);
    } catch (error) {
      logger.error('Redis设置过期时间失败:', error);
      throw error;
    }
  }

  async keys(pattern: string): Promise<string[]> {
    try {
      await this.connect();
      return this.client.keys(pattern);
    } catch (error) {
      logger.error('Redis查找键失败:', error);
      throw error;
    }
  }

  async flushDb(): Promise<void> {
    try {
      await this.connect();
      await this.client.flushDb();
    } catch (error) {
      logger.error('Redis清空数据库失败:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.isConnected) {
        await this.client.disconnect();
        this.isConnected = false;
      }
    } catch (error) {
      logger.error('Redis断开连接失败:', error);
      throw error;
    }
  }
} 