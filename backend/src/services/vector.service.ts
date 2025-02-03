import axios from 'axios';
import { config } from '../config';
import { logger } from '../utils/logger';
import { cacheService } from './cache.service';

interface VectorizeOptions {
  useCache?: boolean;
  batchSize?: number;
}

class VectorService {
  private readonly cachePrefix = 'vector:';
  private readonly cacheTTL = 86400; // 24小时缓存
  private readonly endpoint: string;
  private readonly batchSize: number;
  private readonly maxLength: number;

  constructor() {
    this.endpoint = process.env.BERT_ENDPOINT || 'http://localhost:8000/encode';
    this.batchSize = parseInt(process.env.BERT_BATCH_SIZE || '32', 10);
    this.maxLength = parseInt(process.env.BERT_MAX_LENGTH || '512', 10);
  }

  /**
   * 将文本转换为向量
   */
  async textToVector(text: string, options: VectorizeOptions = {}): Promise<number[]> {
    const cacheKey = `${this.cachePrefix}${text}`;
    
    if (options.useCache) {
      const cached = await cacheService.get<number[]>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const vector = await this.callBertService(text);
      
      if (options.useCache) {
        await cacheService.set(cacheKey, vector, this.cacheTTL);
      }

      return vector;
    } catch (error) {
      logger.error('文本向量化失败:', error);
      throw error;
    }
  }

  /**
   * 批量将文本转换为向量
   */
  async batchTextToVector(texts: string[], options: VectorizeOptions = {}): Promise<number[][]> {
    const batchSize = options.batchSize || this.batchSize;
    const batches: string[][] = [];

    // 将文本分批
    for (let i = 0; i < texts.length; i += batchSize) {
      batches.push(texts.slice(i, i + batchSize));
    }

    const results: number[][] = [];
    
    // 并行处理每个批次
    await Promise.all(
      batches.map(async (batch) => {
        const vectors = await Promise.all(
          batch.map((text) => this.textToVector(text, options))
        );
        results.push(...vectors);
      })
    );

    return results;
  }

  /**
   * 调用BERT服务进行向量转换
   */
  private async callBertService(text: string): Promise<number[]> {
    try {
      // 预处理文本
      const processedText = this.preprocessText(text);
      
      const response = await axios.post(this.endpoint, {
        text: processedText,
        max_length: this.maxLength,
      });

      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('无效的向量转换响应');
      }

      return response.data;
    } catch (error) {
      logger.error('BERT服务调用失败:', error);
      throw error;
    }
  }

  /**
   * 文本预处理
   */
  private preprocessText(text: string): string {
    // 1. 移除多余的空白字符
    text = text.replace(/\s+/g, ' ').trim();
    
    // 2. 截断过长的文本
    if (text.length > this.maxLength) {
      text = text.substring(0, this.maxLength);
    }
    
    // 3. 移除特殊字符
    text = text.replace(/[^\w\s\u4e00-\u9fa5]/g, '');
    
    return text;
  }

  /**
   * 计算向量相似度（余弦相似度）
   */
  calculateSimilarity(vector1: number[], vector2: number[]): number {
    if (vector1.length !== vector2.length) {
      throw new Error('向量维度不匹配');
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < vector1.length; i++) {
      dotProduct += vector1[i] * vector2[i];
      norm1 += vector1[i] * vector1[i];
      norm2 += vector2[i] * vector2[i];
    }

    norm1 = Math.sqrt(norm1);
    norm2 = Math.sqrt(norm2);

    if (norm1 === 0 || norm2 === 0) {
      return 0;
    }

    return dotProduct / (norm1 * norm2);
  }
}

export const vectorService = new VectorService(); 