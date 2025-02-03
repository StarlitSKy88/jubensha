import { Request, Response, NextFunction } from 'express';
import { ragService } from '../services/rag.service';
import {
  CreateKnowledgeDto,
  UpdateKnowledgeDto,
  KnowledgeQueryDto,
  SearchKnowledgeDto,
  BulkImportKnowledgeDto
} from '../dtos/knowledge.dto';
import { RagError } from '../errors/rag.error';

export class KnowledgeController {
  /**
   * 创建知识
   */
  async createKnowledge(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?._id;
      const projectId = req.params.projectId;
      const knowledgeData: CreateKnowledgeDto = req.body;

      const knowledge = await ragService.addKnowledge(userId, projectId, knowledgeData);

      res.status(201).json({
        success: true,
        data: knowledge
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 搜索知识
   */
  async searchKnowledge(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?._id;
      const projectId = req.params.projectId;
      const searchData: SearchKnowledgeDto = req.body;

      const knowledge = await ragService.searchKnowledge(
        userId,
        projectId,
        searchData.query,
        {
          type: searchData.type,
          tags: searchData.tags,
          limit: searchData.limit,
          threshold: searchData.threshold
        }
      );

      res.status(200).json({
        success: true,
        data: knowledge
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新知识
   */
  async updateKnowledge(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?._id;
      const knowledgeId = req.params.id;
      const updateData: UpdateKnowledgeDto = req.body;

      const knowledge = await ragService.updateKnowledge(userId, knowledgeId, updateData);

      res.status(200).json({
        success: true,
        data: knowledge
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除知识
   */
  async deleteKnowledge(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?._id;
      const knowledgeId = req.params.id;

      await ragService.deleteKnowledge(userId, knowledgeId);

      res.status(200).json({
        success: true,
        message: '知识已成功删除'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 批量导入知识
   */
  async bulkImport(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?._id;
      const projectId = req.params.projectId;
      const importData: BulkImportKnowledgeDto = req.body;

      const knowledge = await ragService.bulkImport(userId, projectId, importData.knowledge);

      res.status(201).json({
        success: true,
        data: knowledge
      });
    } catch (error) {
      next(error);
    }
  }
}

export const knowledgeController = new KnowledgeController(); 