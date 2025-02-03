import { MilvusClient } from '@zilliz/milvus2-sdk-node';
import { logger } from '../../../utils/logger';
import { config } from '../../../config';

export class VectorService {
  private readonly client: MilvusClient;
  private readonly COLLECTION_NAME = 'knowledge_vectors';
  private readonly VECTOR_DIM = 768; // BERT base 维度

  constructor() {
    this.client = new MilvusClient({
      address: config.milvus.address,
      username: config.milvus.username,
      password: config.milvus.password
    });
  }

  /**
   * 初始化向量集合
   */
  async initCollection(): Promise<void> {
    try {
      const exists = await this.client.hasCollection({
        collection_name: this.COLLECTION_NAME
      });

      if (!exists) {
        await this.client.createCollection({
          collection_name: this.COLLECTION_NAME,
          dimension: this.VECTOR_DIM,
          metric_type: 'L2'
        });

        await this.client.createIndex({
          collection_name: this.COLLECTION_NAME,
          field_name: 'vector',
          index_type: 'IVF_FLAT',
          metric_type: 'L2',
          params: { nlist: 1024 }
        });

        logger.info('向量集合初始化成功');
      }
    } catch (error) {
      logger.error('向量集合初始化失败:', error);
      throw error;
    }
  }

  /**
   * 计算文本相似度
   */
  async calculateTextSimilarity(text1: string, text2: string): Promise<number> {
    try {
      // 获取文本向量
      const vector1 = await this.textToVector(text1);
      const vector2 = await this.textToVector(text2);

      // 计算向量距离
      return this.calculateVectorDistance(vector1, vector2);
    } catch (error) {
      logger.error('计算文本相似度失败:', error);
      return 0;
    }
  }

  /**
   * 计算向量距离
   */
  async calculateVectorDistance(vector1: number[], vector2: number[]): Promise<number> {
    try {
      if (vector1.length !== vector2.length) {
        throw new Error('向量维度不匹配');
      }

      // 计算欧氏距离
      const distance = Math.sqrt(
        vector1.reduce((sum, v1, i) => {
          const diff = v1 - vector2[i];
          return sum + diff * diff;
        }, 0)
      );

      // 归一化距离到 [0, 1] 区间
      return 1 / (1 + distance);
    } catch (error) {
      logger.error('计算向量距离失败:', error);
      return 0;
    }
  }

  /**
   * 文本转向量
   */
  private async textToVector(text: string): Promise<number[]> {
    try {
      // 调用 BERT 服务获取文本向量
      const response = await fetch(config.bert.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        throw new Error('BERT 服务请求失败');
      }

      const { vector } = await response.json();
      return vector;
    } catch (error) {
      logger.error('文本转向量失败:', error);
      throw error;
    }
  }

  /**
   * 搜索相似向量
   */
  async searchSimilarVectors(
    vector: number[],
    limit: number = 10,
    threshold: number = 0.5
  ): Promise<Array<{ id: string; score: number }>> {
    try {
      const response = await this.client.search({
        collection_name: this.COLLECTION_NAME,
        vector: vector,
        limit: limit,
        params: { nprobe: 16 }
      });

      return response.results
        .filter(result => result.score >= threshold)
        .map(result => ({
          id: result.id,
          score: result.score
        }));
    } catch (error) {
      logger.error('搜索相似向量失败:', error);
      return [];
    }
  }

  /**
   * 插入向量
   */
  async insertVector(id: string, vector: number[]): Promise<void> {
    try {
      await this.client.insert({
        collection_name: this.COLLECTION_NAME,
        data: [
          {
            id,
            vector
          }
        ]
      });
    } catch (error) {
      logger.error('插入向量失败:', error);
      throw error;
    }
  }

  /**
   * 删除向量
   */
  async deleteVector(id: string): Promise<void> {
    try {
      await this.client.deleteEntities({
        collection_name: this.COLLECTION_NAME,
        ids: [id]
      });
    } catch (error) {
      logger.error('删除向量失败:', error);
      throw error;
    }
  }

  /**
   * 更新向量
   */
  async updateVector(id: string, vector: number[]): Promise<void> {
    try {
      await this.deleteVector(id);
      await this.insertVector(id, vector);
    } catch (error) {
      logger.error('更新向量失败:', error);
      throw error;
    }
  }
}

export const vectorService = new VectorService(); 