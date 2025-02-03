import { createClient, RedisClientType } from 'redis';
import { config } from '../config';
import { logger } from '../utils/logger';

class CacheService {
  private readonly client: RedisClientType;

  constructor() {
    this.client = createClient({
      url: `redis://${config.redis.host}:${config.redis.port}`,
      password: config.redis.password
    });

    this.client.on('error', (err: Error) => {
      logger.error('Redis 连接错误:', err);
    });

    this.client.on('connect', () => {
      logger.info('Redis 连接成功');
    });

    // 连接 Redis
    this.client.connect().catch((err: Error) => {
      logger.error('Redis 连接失败:', err);
    });
  }

  /**
   * 设置缓存
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      if (ttl) {
        await this.client.setEx(key, ttl, serializedValue);
      } else {
        await this.client.set(key, serializedValue);
      }
    } catch (error) {
      logger.error('设置缓存失败:', error);
      throw error;
    }
  }

  /**
   * 获取缓存
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error('获取缓存失败:', error);
      throw error;
    }
  }

  /**
   * 删除缓存
   */
  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      logger.error('删除缓存失败:', error);
      throw error;
    }
  }

  /**
   * 按模式删除缓存
   */
  async delByPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } catch (error) {
      logger.error('按模式删除缓存失败:', error);
      throw error;
    }
  }

  /**
   * 设置哈希表字段
   */
  async hset(key: string, field: string, value: unknown): Promise<void> {
    try {
      await this.client.hSet(key, field, JSON.stringify(value));
    } catch (error) {
      logger.error('设置哈希表字段失败:', error);
      throw error;
    }
  }

  /**
   * 获取哈希表字段
   */
  async hget<T>(key: string, field: string): Promise<T | null> {
    try {
      const value = await this.client.hGet(key, field);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error('获取哈希表字段失败:', error);
      throw error;
    }
  }

  /**
   * 删除哈希表字段
   */
  async hdel(key: string, field: string): Promise<void> {
    try {
      await this.client.hDel(key, field);
    } catch (error) {
      logger.error('删除哈希表字段失败:', error);
      throw error;
    }
  }

  /**
   * 列表左侧推入
   */
  async lpush(key: string, value: unknown): Promise<void> {
    try {
      await this.client.lPush(key, JSON.stringify(value));
    } catch (error) {
      logger.error('列表左侧推入失败:', error);
      throw error;
    }
  }

  /**
   * 获取列表范围
   */
  async lrange<T>(key: string, start: number, stop: number): Promise<T[]> {
    try {
      const values = await this.client.lRange(key, start, stop);
      return values.map(value => JSON.parse(value)) as T[];
    } catch (error) {
      logger.error('获取列表范围失败:', error);
      throw error;
    }
  }

  /**
   * 有序集合添加
   */
  async zadd(key: string, score: number, value: unknown): Promise<void> {
    try {
      await this.client.zAdd(key, { score, value: JSON.stringify(value) });
    } catch (error) {
      logger.error('有序集合添加失败:', error);
      throw error;
    }
  }

  /**
   * 获取有序集合范围
   */
  async zrange<T>(key: string, start: number, stop: number): Promise<T[]> {
    try {
      const values = await this.client.zRange(key, start, stop);
      return values.map(value => JSON.parse(value)) as T[];
    } catch (error) {
      logger.error('获取有序集合范围失败:', error);
      throw error;
    }
  }

  /**
   * 设置过期时间
   */
  async expire(key: string, seconds: number): Promise<void> {
    try {
      await this.client.expire(key, seconds);
    } catch (error) {
      logger.error('设置过期时间失败:', error);
      throw error;
    }
  }

  /**
   * 获取过期时间
   */
  async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      logger.error('获取过期时间失败:', error);
      throw error;
    }
  }

  /**
   * 检查键是否存在
   */
  async exists(key: string): Promise<boolean> {
    try {
      return (await this.client.exists(key)) === 1;
    } catch (error) {
      logger.error('检查键是否存在失败:', error);
      throw error;
    }
  }

  /**
   * 递增
   */
  async incr(key: string): Promise<number> {
    try {
      return await this.client.incr(key);
    } catch (error) {
      logger.error('递增失败:', error);
      throw error;
    }
  }

  /**
   * 递减
   */
  async decr(key: string): Promise<number> {
    try {
      return await this.client.decr(key);
    } catch (error) {
      logger.error('递减失败:', error);
      throw error;
    }
  }
}

export const cacheService = new CacheService(); 