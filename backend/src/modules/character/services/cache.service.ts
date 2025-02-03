import { redis, CACHE_KEYS, CACHE_TTL } from '../../../config/redis';
import { logger } from '../../../utils/logger';

export class CacheService {
  /**
   * 设置缓存
   */
  async set(key: string, data: any, ttl: number = 3600): Promise<void> {
    try {
      await redis.set(key, JSON.stringify(data), 'EX', ttl);
    } catch (error) {
      logger.error('Cache set error:', error);
    }
  }

  /**
   * 获取缓存
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * 删除缓存
   */
  async del(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      logger.error('Cache delete error:', error);
    }
  }

  /**
   * 批量删除缓存
   */
  async delByPattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      logger.error('Cache batch delete error:', error);
    }
  }

  /**
   * 获取角色缓存
   */
  async getCharacter(characterId: string) {
    return this.get(`${CACHE_KEYS.CHARACTER}${characterId}`);
  }

  /**
   * 设置角色缓存
   */
  async setCharacter(characterId: string, data: any) {
    await this.set(
      `${CACHE_KEYS.CHARACTER}${characterId}`,
      data,
      CACHE_TTL.CHARACTER
    );
  }

  /**
   * 获取角色列表缓存
   */
  async getCharacterList(projectId: string, page: number, limit: number) {
    return this.get(
      `${CACHE_KEYS.CHARACTER_LIST}${projectId}:${page}:${limit}`
    );
  }

  /**
   * 设置角色列表缓存
   */
  async setCharacterList(
    projectId: string,
    page: number,
    limit: number,
    data: any
  ) {
    await this.set(
      `${CACHE_KEYS.CHARACTER_LIST}${projectId}:${page}:${limit}`,
      data,
      CACHE_TTL.CHARACTER_LIST
    );
  }

  /**
   * 获取搜索结果缓存
   */
  async getSearchResults(queryHash: string) {
    return this.get(`${CACHE_KEYS.CHARACTER_SEARCH}${queryHash}`);
  }

  /**
   * 设置搜索结果缓存
   */
  async setSearchResults(queryHash: string, data: any) {
    await this.set(
      `${CACHE_KEYS.CHARACTER_SEARCH}${queryHash}`,
      data,
      CACHE_TTL.CHARACTER_SEARCH
    );
  }

  /**
   * 获取角色关系网络缓存
   */
  async getCharacterNetwork(projectId: string) {
    return this.get(`${CACHE_KEYS.CHARACTER_NETWORK}${projectId}`);
  }

  /**
   * 设置角色关系网络缓存
   */
  async setCharacterNetwork(projectId: string, data: any) {
    await this.set(
      `${CACHE_KEYS.CHARACTER_NETWORK}${projectId}`,
      data,
      CACHE_TTL.CHARACTER_NETWORK
    );
  }

  /**
   * 获取相似角色缓存
   */
  async getSimilarCharacters(characterId: string) {
    return this.get(`${CACHE_KEYS.CHARACTER_SIMILAR}${characterId}`);
  }

  /**
   * 设置相似角色缓存
   */
  async setSimilarCharacters(characterId: string, data: any) {
    await this.set(
      `${CACHE_KEYS.CHARACTER_SIMILAR}${characterId}`,
      data,
      CACHE_TTL.CHARACTER_SIMILAR
    );
  }

  /**
   * 清除角色相关的所有缓存
   */
  async clearCharacterCache(characterId: string) {
    await Promise.all([
      this.del(`${CACHE_KEYS.CHARACTER}${characterId}`),
      this.delByPattern(`${CACHE_KEYS.CHARACTER_LIST}*`),
      this.delByPattern(`${CACHE_KEYS.CHARACTER_SEARCH}*`),
      this.delByPattern(`${CACHE_KEYS.CHARACTER_NETWORK}*`),
      this.del(`${CACHE_KEYS.CHARACTER_SIMILAR}${characterId}`)
    ]);
  }
}

export const cacheService = new CacheService(); 