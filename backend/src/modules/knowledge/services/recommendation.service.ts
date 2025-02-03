import { Types } from 'mongoose';
import { Knowledge } from '../models/knowledge.model';
import { KnowledgeRecommendation, IKnowledgeRecommendation } from '../models/knowledge-recommendation.model';
import { KnowledgeError } from '../errors/knowledge.error';
import { cacheService } from '../../../services/cache.service';
import { vectorService } from './vector.service';
import { logger } from '../../../utils/logger';

export class RecommendationService {
  private readonly CACHE_TTL = 3600; // 1小时
  private readonly MAX_RECOMMENDATIONS = 10;
  private readonly SIMILARITY_THRESHOLD = 0.5;
  private readonly CACHE_KEY_PREFIX = 'knowledge:recommendation:';

  /**
   * 获取知识推荐
   */
  async getRecommendations(
    knowledgeId: Types.ObjectId,
    limit: number = this.MAX_RECOMMENDATIONS
  ): Promise<IKnowledgeRecommendation | null> {
    try {
      // 尝试从缓存获取
      const cacheKey = `${this.CACHE_KEY_PREFIX}${knowledgeId}`;
      const cachedRecommendations = await cacheService.get<IKnowledgeRecommendation>(cacheKey);
      if (cachedRecommendations) {
        return cachedRecommendations;
      }

      // 获取知识详情
      const knowledge = await Knowledge.findById(knowledgeId);
      if (!knowledge) {
        throw new KnowledgeError('知识不存在', 404);
      }

      // 获取或创建推荐
      let recommendation = await KnowledgeRecommendation.findOne({
        knowledgeId,
        projectId: knowledge.projectId
      });

      // 如果推荐不存在或已过期，重新计算
      if (
        !recommendation ||
        Date.now() - recommendation.metadata.lastCalculated.getTime() > 24 * 60 * 60 * 1000 // 24小时
      ) {
        recommendation = await this.calculateRecommendations(knowledge);
      }

      // 限制推荐数量
      recommendation.recommendations = recommendation.recommendations.slice(0, limit);

      // 缓存结果
      await cacheService.set(cacheKey, recommendation, this.CACHE_TTL);

      return recommendation;
    } catch (error) {
      logger.error('获取知识推荐失败:', error);
      throw error instanceof KnowledgeError
        ? error
        : new KnowledgeError('获取知识推荐失败', 500);
    }
  }

  /**
   * 计算知识推荐
   */
  private async calculateRecommendations(
    knowledge: any
  ): Promise<IKnowledgeRecommendation> {
    try {
      // 获取同项目下的其他知识
      const otherKnowledge = await Knowledge.find({
        projectId: knowledge.projectId,
        _id: { $ne: knowledge._id }
      }).select('title content tags vector');

      // 计算不同类型的相似度
      const recommendations = await Promise.all(
        otherKnowledge.map(async (other) => {
          // 计算内容相似度
          const contentSimilarity = await this.calculateContentSimilarity(
            knowledge.content,
            other.content
          );

          // 计算标签重叠度
          const tagOverlap = this.calculateTagOverlap(
            knowledge.tags,
            other.tags
          );

          // 计算向量距离
          const vectorDistance = await this.calculateVectorDistance(
            knowledge.vector,
            other.vector
          );

          // 计算综合得分
          const score = this.calculateScore({
            contentSimilarity,
            tagOverlap,
            vectorDistance
          });

          // 只返回超过阈值的推荐
          if (score >= this.SIMILARITY_THRESHOLD) {
            return {
              knowledgeId: other._id,
              score,
              type: this.determineRecommendationType(contentSimilarity, tagOverlap, vectorDistance),
              reason: this.generateRecommendationReason(contentSimilarity, tagOverlap, vectorDistance)
            };
          }
          return null;
        })
      );

      // 过滤掉空值并按得分排序
      const validRecommendations = recommendations
        .filter((r): r is NonNullable<typeof r> => r !== null)
        .sort((a, b) => b.score - a.score);

      // 创建或更新推荐记录
      const recommendationDoc = await KnowledgeRecommendation.findOneAndUpdate(
        {
          knowledgeId: knowledge._id,
          projectId: knowledge.projectId
        },
        {
          recommendations: validRecommendations,
          metadata: {
            contentSimilarity: validRecommendations[0]?.score || 0,
            tagOverlap: this.calculateAverageTagOverlap(validRecommendations),
            vectorDistance: this.calculateAverageVectorDistance(validRecommendations),
            lastCalculated: new Date()
          }
        },
        {
          new: true,
          upsert: true
        }
      );

      return recommendationDoc;
    } catch (error) {
      logger.error('计算知识推荐失败:', error);
      throw new KnowledgeError('计算知识推荐失败', 500);
    }
  }

  /**
   * 计算内容相似度
   */
  private async calculateContentSimilarity(
    content1: string,
    content2: string
  ): Promise<number> {
    try {
      // 使用向量服务计算文本相似度
      const similarity = await vectorService.calculateTextSimilarity(content1, content2);
      return similarity;
    } catch (error) {
      logger.error('计算内容相似度失败:', error);
      return 0;
    }
  }

  /**
   * 计算标签重叠度
   */
  private calculateTagOverlap(tags1: string[], tags2: string[]): number {
    if (!tags1.length || !tags2.length) return 0;

    const set1 = new Set(tags1);
    const set2 = new Set(tags2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));

    return intersection.size / Math.max(set1.size, set2.size);
  }

  /**
   * 计算向量距离
   */
  private async calculateVectorDistance(
    vector1: number[],
    vector2: number[]
  ): Promise<number> {
    try {
      // 使用向量服务计算向量相似度
      const distance = await vectorService.calculateVectorDistance(vector1, vector2);
      return 1 - distance; // 转换为相似度
    } catch (error) {
      logger.error('计算向量距离失败:', error);
      return 0;
    }
  }

  /**
   * 计算综合得分
   */
  private calculateScore(similarities: {
    contentSimilarity: number;
    tagOverlap: number;
    vectorDistance: number;
  }): number {
    const weights = {
      content: 0.4,
      tag: 0.3,
      vector: 0.3
    };

    return (
      similarities.contentSimilarity * weights.content +
      similarities.tagOverlap * weights.tag +
      similarities.vectorDistance * weights.vector
    );
  }

  /**
   * 确定推荐类型
   */
  private determineRecommendationType(
    contentSimilarity: number,
    tagOverlap: number,
    vectorDistance: number
  ): 'content' | 'tag' | 'vector' {
    const scores = {
      content: contentSimilarity,
      tag: tagOverlap,
      vector: vectorDistance
    };

    return Object.entries(scores).reduce((a, b) => (b[1] > a[1] ? b : a))[0] as
      | 'content'
      | 'tag'
      | 'vector';
  }

  /**
   * 生成推荐原因
   */
  private generateRecommendationReason(
    contentSimilarity: number,
    tagOverlap: number,
    vectorDistance: number
  ): string {
    const type = this.determineRecommendationType(
      contentSimilarity,
      tagOverlap,
      vectorDistance
    );

    const reasons = {
      content: '内容相似度较高',
      tag: '具有相似的标签',
      vector: '语义相关度高'
    };

    return reasons[type];
  }

  /**
   * 计算平均标签重叠度
   */
  private calculateAverageTagOverlap(recommendations: any[]): number {
    if (!recommendations.length) return 0;
    return (
      recommendations.reduce(
        (sum, rec) => sum + (rec.type === 'tag' ? rec.score : 0),
        0
      ) / recommendations.length
    );
  }

  /**
   * 计算平均向量距离
   */
  private calculateAverageVectorDistance(recommendations: any[]): number {
    if (!recommendations.length) return 0;
    return (
      recommendations.reduce(
        (sum, rec) => sum + (rec.type === 'vector' ? rec.score : 0),
        0
      ) / recommendations.length
    );
  }
}

export const recommendationService = new RecommendationService(); 