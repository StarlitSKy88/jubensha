import { OpenAI } from 'openai';
import { config } from '@config/index';
import { logger } from '@utils/logger';
import { ExternalServiceError } from '@utils/errors';
import { Redis } from '@utils/redis';

export class EmbeddingService {
  private openai: OpenAI;
  private redis: Redis;
  private readonly cachePrefix = 'embedding:';
  private readonly cacheTTL = 24 * 60 * 60; // 24小时

  constructor() {
    this.openai = new OpenAI({
      apiKey: config.openai.apiKey
    });
    this.redis = new Redis();
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      // 检查缓存
      const cacheKey = this.cachePrefix + this.hashText(text);
      const cachedEmbedding = await this.redis.get(cacheKey);
      
      if (cachedEmbedding) {
        return JSON.parse(cachedEmbedding);
      }

      // 调用OpenAI生成embedding
      const response = await this.openai.embeddings.create({
        model: config.openai.models.embedding,
        input: text
      });

      const embedding = response.data[0].embedding;

      // 缓存结果
      await this.redis.set(cacheKey, JSON.stringify(embedding), {
        EX: this.cacheTTL
      });

      return embedding;
    } catch (error) {
      logger.error('生成embedding失败:', error);
      throw new ExternalServiceError('生成embedding失败', 'OpenAI');
    }
  }

  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      const embeddings: number[][] = [];
      const uncachedTexts: string[] = [];
      const uncachedIndices: number[] = [];

      // 检查缓存
      for (let i = 0; i < texts.length; i++) {
        const text = texts[i];
        const cacheKey = this.cachePrefix + this.hashText(text);
        const cachedEmbedding = await this.redis.get(cacheKey);

        if (cachedEmbedding) {
          embeddings[i] = JSON.parse(cachedEmbedding);
        } else {
          uncachedTexts.push(text);
          uncachedIndices.push(i);
        }
      }

      if (uncachedTexts.length > 0) {
        // 批量调用OpenAI生成embeddings
        const response = await this.openai.embeddings.create({
          model: config.openai.models.embedding,
          input: uncachedTexts
        });

        // 处理结果
        for (let i = 0; i < uncachedTexts.length; i++) {
          const embedding = response.data[i].embedding;
          const originalIndex = uncachedIndices[i];
          embeddings[originalIndex] = embedding;

          // 缓存结果
          const cacheKey = this.cachePrefix + this.hashText(uncachedTexts[i]);
          await this.redis.set(cacheKey, JSON.stringify(embedding), {
            EX: this.cacheTTL
          });
        }
      }

      return embeddings;
    } catch (error) {
      logger.error('批量生成embeddings失败:', error);
      throw new ExternalServiceError('批量生成embeddings失败', 'OpenAI');
    }
  }

  private hashText(text: string): string {
    // 简单的哈希函数，用于生成缓存key
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString();
  }

  async clearCache(): Promise<void> {
    try {
      const keys = await this.redis.keys(this.cachePrefix + '*');
      for (const key of keys) {
        await this.redis.del(key);
      }
      logger.info('Embedding缓存已清空');
    } catch (error) {
      logger.error('清空Embedding缓存失败:', error);
      throw error;
    }
  }

  async getCacheStats(): Promise<{
    totalKeys: number;
    sampleKeys: string[];
    memoryUsage: number;
  }> {
    try {
      const keys = await this.redis.keys(this.cachePrefix + '*');
      const sampleSize = Math.min(10, keys.length);
      const sampleKeys = keys.slice(0, sampleSize);

      return {
        totalKeys: keys.length,
        sampleKeys,
        memoryUsage: 0 // TODO: 实现内存使用统计
      };
    } catch (error) {
      logger.error('获取Embedding缓存统计失败:', error);
      throw error;
    }
  }
} 