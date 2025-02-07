import Redis from 'ioredis';
import { Logger } from '../utils/logger';

export class CacheService {
  private client: Redis;
  private prefix: string;
  private logger: Logger;

  constructor(options: { prefix?: string; logger?: Logger } = {}) {
    this.client = new Redis();
    this.prefix = options.prefix || 'cache:';
    this.logger = options.logger || console;
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  /**
   * 设置缓存
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      const fullKey = this.getKey(key);
      
      if (ttl) {
        await this.client.setex(fullKey, ttl, serializedValue);
      } else {
        await this.client.set(fullKey, serializedValue);
      }
    } catch (error) {
      this.logger.error('设置缓存失败:', error);
      throw error;
    }
  }

  /**
   * 获取缓存
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(this.getKey(key));
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.error('获取缓存失败:', error);
      throw error;
    }
  }

  /**
   * 删除缓存
   */
  async del(key: string): Promise<void> {
    try {
      await this.client.del(this.getKey(key));
    } catch (error) {
      this.logger.error('删除缓存失败:', error);
      throw error;
    }
  }

  /**
   * 获取列表范围
   */
  async lrange<T>(key: string, start: number, stop: number): Promise<T[]> {
    try {
      const values = await this.client.lrange(this.getKey(key), start, stop);
      return values.map(value => JSON.parse(value)) as T[];
    } catch (error) {
      this.logger.error('获取列表范围失败:', error);
      throw error;
    }
  }

  /**
   * 有序集合添加
   */
  async zadd(key: string, score: number, value: unknown): Promise<void> {
    try {
      await this.client.zadd(this.getKey(key), score, JSON.stringify(value));
    } catch (error) {
      this.logger.error('有序集合添加失败:', error);
      throw error;
    }
  }

  /**
   * 获取有序集合范围
   */
  async zrange<T>(key: string, start: number, stop: number): Promise<T[]> {
    try {
      const values = await this.client.zrange(this.getKey(key), start, stop);
      return values.map(value => JSON.parse(value)) as T[];
    } catch (error) {
      this.logger.error('获取有序集合范围失败:', error);
      throw error;
    }
  }

  /**
   * 设置过期时间
   */
  async expire(key: string, seconds: number): Promise<void> {
    try {
      await this.client.expire(this.getKey(key), seconds);
    } catch (error) {
      this.logger.error('设置过期时间失败:', error);
      throw error;
    }
  }

  /**
   * 获取过期时间
   */
  async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(this.getKey(key));
    } catch (error) {
      this.logger.error('获取过期时间失败:', error);
      throw error;
    }
  }

  /**
   * 检查键是否存在
   */
  async exists(key: string): Promise<boolean> {
    try {
      return (await this.client.exists(this.getKey(key))) === 1;
    } catch (error) {
      this.logger.error('检查键是否存在失败:', error);
      throw error;
    }
  }

  /**
   * 递增
   */
  async incr(key: string): Promise<number> {
    try {
      return await this.client.incr(this.getKey(key));
    } catch (error) {
      this.logger.error('递增失败:', error);
      throw error;
    }
  }

  /**
   * 清理所有缓存
   */
  async clear(): Promise<void> {
    try {
      const keys = await this.client.keys(`${this.prefix}*`);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch (error) {
      this.logger.error('清理缓存失败:', error);
      throw error;
    }
  }
}

export const cacheService = new CacheService(); 