import { Request, Response, NextFunction } from 'express';
import { KnowledgeService } from '../services/knowledge.service';
import { EmbeddingService } from '../services/embedding.service';
import { RAGService } from '../services/rag.service';
import { validate } from '@middlewares/validate.middleware';
import { logger } from '@utils/logger';

export class KnowledgeController {
  private knowledgeService: KnowledgeService;

  constructor() {
    const embeddingService = new EmbeddingService();
    const ragService = new RAGService();
    this.knowledgeService = new KnowledgeService(embeddingService, ragService);
  }

  async createKnowledge(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const knowledge = await this.knowledgeService.createKnowledge({
        ...req.body,
        projectId,
        createdBy: req.user.id
      });

      logger.info('知识创建成功:', knowledge.id);

      res.status(201).json({
        success: true,
        message: '创建成功',
        data: knowledge
      });
    } catch (error) {
      next(error);
    }
  }

  async updateKnowledge(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId, id } = req.params;
      const knowledge = await this.knowledgeService.updateKnowledge(id, {
        ...req.body,
        updatedBy: req.user.id
      });

      logger.info('知识更新成功:', id);

      res.json({
        success: true,
        message: '更新成功',
        data: knowledge
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteKnowledge(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId, id } = req.params;
      await this.knowledgeService.deleteKnowledge(id);

      logger.info('知识删除成功:', id);

      res.json({
        success: true,
        message: '删除成功'
      });
    } catch (error) {
      next(error);
    }
  }

  async searchKnowledge(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const { text, type, category, tags, limit } = req.body;

      const results = await this.knowledgeService.searchKnowledge({
        text,
        type,
        category,
        tags,
        projectId,
        limit
      });

      logger.info('知识搜索成功:', {
        projectId,
        resultCount: results.length
      });

      res.json({
        success: true,
        data: results
      });
    } catch (error) {
      next(error);
    }
  }

  async getKnowledge(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId, id } = req.params;
      const knowledge = await this.knowledgeService.getKnowledgeById(id);

      res.json({
        success: true,
        data: knowledge
      });
    } catch (error) {
      next(error);
    }
  }

  async getKnowledgeList(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const { type, category, tags, page, limit } = req.query;

      const results = await this.knowledgeService.getKnowledgeList({
        projectId,
        type: type as any,
        category: category as string,
        tags: tags ? (tags as string).split(',') : undefined,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined
      });

      res.json({
        success: true,
        data: results
      });
    } catch (error) {
      next(error);
    }
  }

  async bulkImport(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const results = await this.knowledgeService.bulkImport({
        items: req.body.items,
        projectId,
        createdBy: req.user.id
      });

      logger.info('知识批量导入完成:', {
        projectId,
        total: results.total,
        created: results.created,
        failed: results.failed
      });

      res.json({
        success: true,
        message: '导入完成',
        data: results
      });
    } catch (error) {
      next(error);
    }
  }
}

export const knowledgeController = new KnowledgeController(); 