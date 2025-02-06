import { Request, Response, NextFunction } from 'express';
import { ScriptService } from '../services/script.service';
import { logger } from '@utils/logger';

export class ScriptController {
  constructor(private scriptService: ScriptService) {}

  async createScript(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const script = await this.scriptService.createScript({
        ...req.body,
        projectId,
        createdBy: req.user.id
      });

      logger.info('剧本创建成功:', script.id);

      res.status(201).json({
        success: true,
        message: '创建成功',
        data: script
      });
    } catch (error) {
      next(error);
    }
  }

  async updateScript(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId, id } = req.params;
      const script = await this.scriptService.updateScript(id, {
        ...req.body,
        updatedBy: req.user.id
      });

      logger.info('剧本更新成功:', id);

      res.json({
        success: true,
        message: '更新成功',
        data: script
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteScript(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId, id } = req.params;
      await this.scriptService.deleteScript(id);

      logger.info('剧本删除成功:', id);

      res.json({
        success: true,
        message: '删除成功'
      });
    } catch (error) {
      next(error);
    }
  }

  async getScript(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId, id } = req.params;
      const script = await this.scriptService.getScriptById(id);

      res.json({
        success: true,
        data: script
      });
    } catch (error) {
      next(error);
    }
  }

  async getScriptList(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const { status, difficulty, tags, page, limit } = req.query;

      const results = await this.scriptService.getScriptList({
        projectId,
        status: status as any,
        difficulty: difficulty as any,
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

  async publishScript(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId, id } = req.params;
      const script = await this.scriptService.publishScript(id, req.user.id);

      logger.info('剧本发布成功:', id);

      res.json({
        success: true,
        message: '发布成功',
        data: script
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePlayCount(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId, id } = req.params;
      await this.scriptService.updatePlayCount(id);

      res.json({
        success: true,
        message: '游玩次数更新成功'
      });
    } catch (error) {
      next(error);
    }
  }

  async updateRating(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId, id } = req.params;
      const { rating } = req.body;

      await this.scriptService.updateRating(id, rating);

      res.json({
        success: true,
        message: '评分更新成功'
      });
    } catch (error) {
      next(error);
    }
  }
}

// 创建控制器实例
export const scriptController = new ScriptController(new ScriptService()); 