import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { CacheService } from '../../src/services/cache';
import { Logger } from '../../src/utils/logger';

describe('CacheService', () => {
  let cacheService: CacheService;
  let mockLogger: Logger;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn()
    };
    cacheService = new CacheService({ logger: mockLogger });
  });

  describe('基础缓存操作', () => {
    it('应该能正确设置和获取缓存', async () => {
      const key = 'test-key';
      const value = { data: 'test-value' };
      
      await cacheService.set(key, value);
      const result = await cacheService.get(key);
      
      expect(result).toEqual(value);
    });

    it('应该能正确设置带TTL的缓存', async () => {
      const key = 'test-ttl-key';
      const value = { data: 'test-value' };
      const ttl = 60;
      
      await cacheService.set(key, value, ttl);
      const result = await cacheService.get(key);
      const remainingTtl = await cacheService.ttl(key);
      
      expect(result).toEqual(value);
      expect(remainingTtl).toBeLessThanOrEqual(ttl);
      expect(remainingTtl).toBeGreaterThan(0);
    });

    it('获取不存在的键应该返回null', async () => {
      const result = await cacheService.get('non-existent-key');
      expect(result).toBeNull();
    });

    it('应该能正确删除缓存', async () => {
      const key = 'test-delete-key';
      const value = { data: 'test-value' };
      
      await cacheService.set(key, value);
      await cacheService.del(key);
      const result = await cacheService.get(key);
      
      expect(result).toBeNull();
    });
  });

  describe('列表操作', () => {
    it('应该能正确操作列表范围', async () => {
      const key = 'test-list';
      const values = [1, 2, 3, 4, 5];
      
      for (const value of values) {
        await cacheService.zadd(key, value, value);
      }
      
      const result = await cacheService.zrange(key, 0, -1);
      expect(result).toEqual(values);
    });
  });

  describe('有序集合操作', () => {
    it('应该能正确操作有序集合', async () => {
      const key = 'test-zset';
      const items = [
        { score: 1, value: 'A' },
        { score: 2, value: 'B' },
        { score: 3, value: 'C' }
      ];
      
      for (const item of items) {
        await cacheService.zadd(key, item.score, item.value);
      }
      
      const result = await cacheService.zrange(key, 0, -1);
      expect(result).toEqual(items.map(item => item.value));
    });
  });

  describe('键管理', () => {
    it('应该能正确检查键是否存在', async () => {
      const key = 'test-exists-key';
      const value = { data: 'test-value' };
      
      await cacheService.set(key, value);
      const exists = await cacheService.exists(key);
      
      expect(exists).toBe(true);
    });

    it('应该能正确设置和获取过期时间', async () => {
      const key = 'test-expire-key';
      const value = { data: 'test-value' };
      const ttl = 60;
      
      await cacheService.set(key, value);
      await cacheService.expire(key, ttl);
      const remainingTtl = await cacheService.ttl(key);
      
      expect(remainingTtl).toBeLessThanOrEqual(ttl);
      expect(remainingTtl).toBeGreaterThan(0);
    });
  });

  describe('计数器操作', () => {
    it('应该能正确执行递增操作', async () => {
      const key = 'test-counter';
      
      const value1 = await cacheService.incr(key);
      const value2 = await cacheService.incr(key);
      
      expect(value1).toBe(1);
      expect(value2).toBe(2);
    });
  });

  describe('错误处理', () => {
    it('应该正确记录错误日志', async () => {
      const key = 'test-error-key';
      const error = new Error('测试错误');
      
      jest.spyOn(cacheService['client'], 'set').mockRejectedValue(error);
      
      try {
        await cacheService.set(key, 'value');
      } catch (e) {
        expect(mockLogger.error).toHaveBeenCalledWith('设置缓存失败:', error);
      }
    });
  });
}); 