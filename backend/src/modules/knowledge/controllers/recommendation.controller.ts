import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { recommendationService } from '../services/recommendation.service';
import { KnowledgeError } from '../errors/knowledge.error';
import { logger } from '../../../utils/logger';

export class RecommendationController {
  /**
   * 获取知识推荐
   */
  async getRecommendations(req: Request, res: Response): Promise<void> {
    try {
      const knowledgeId = new Types.ObjectId(req.params.knowledgeId);
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;

      const recommendations = await recommendationService.getRecommendations(knowledgeId, limit);

      res.json({
        success: true,
        data: recommendations
      });
    } catch (error) {
      logger.error('获取知识推荐失败:', error);
      if (error instanceof KnowledgeError) {
        res.status(error.status).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: '获取知识推荐失败'
        });
      }
    }
  }

  /**
   * 刷新知识推荐
   */
  async refreshRecommendations(req: Request, res: Response): Promise<void> {
    try {
      const knowledgeId = new Types.ObjectId(req.params.knowledgeId);
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;

      // 清除缓存并重新计算推荐
      const recommendations = await recommendationService.getRecommendations(knowledgeId, limit, true);

      res.json({
        success: true,
        data: recommendations
      });
    } catch (error) {
      logger.error('刷新知识推荐失败:', error);
      if (error instanceof KnowledgeError) {
        res.status(error.status).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: '刷新知识推荐失败'
        });
      }
    }
  }

  /**
   * 获取相似知识
   */
  async getSimilarKnowledge(req: Request, res: Response): Promise<void> {
    try {
      const { content } = req.body;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const threshold = req.query.threshold ? parseFloat(req.query.threshold as string) : undefined;

      if (!content) {
        throw new KnowledgeError('内容不能为空', 400);
      }

      const similarKnowledge = await recommendationService.getSimilarKnowledge(
        content,
        limit,
        threshold
      );

      res.json({
        success: true,
        data: similarKnowledge
      });
    } catch (error) {
      logger.error('获取相似知识失败:', error);
      if (error instanceof KnowledgeError) {
        res.status(error.status).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: '获取相似知识失败'
        });
      }
    }
  }
}

export const recommendationController = new RecommendationController(); 