import { ScriptModel, IScript, ScriptStatus, ScriptDifficulty } from '../models/script.model';
import { ScriptNotFoundError, ScriptValidationError } from '../errors/script.error';
import { logger } from '@utils/logger';

export class ScriptService {
  async createScript(data: {
    title: string;
    description: string;
    content: string;
    difficulty: ScriptDifficulty;
    playerCount: {
      min: number;
      max: number;
    };
    duration: number;
    tags: string[];
    projectId: string;
    createdBy: string;
  }): Promise<IScript> {
    try {
      // 验证玩家人数
      if (data.playerCount.min > data.playerCount.max) {
        throw new ScriptValidationError('最小玩家数不能大于最大玩家数');
      }

      // 创建剧本
      const script = await ScriptModel.create({
        ...data,
        status: ScriptStatus.DRAFT,
        metadata: {
          version: 1,
          author: data.createdBy,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        updatedBy: data.createdBy
      });

      logger.info('剧本创建成功:', script.id);
      return script;
    } catch (error) {
      logger.error('剧本创建失败:', error);
      throw error;
    }
  }

  async updateScript(
    id: string,
    data: {
      title?: string;
      description?: string;
      content?: string;
      difficulty?: ScriptDifficulty;
      playerCount?: {
        min: number;
        max: number;
      };
      duration?: number;
      tags?: string[];
      updatedBy: string;
    }
  ): Promise<IScript> {
    try {
      // 验证剧本存在
      const script = await ScriptModel.findById(id);
      if (!script) {
        throw new ScriptNotFoundError(id);
      }

      // 验证玩家人数
      if (data.playerCount && data.playerCount.min > data.playerCount.max) {
        throw new ScriptValidationError('最小玩家数不能大于最大玩家数');
      }

      // 更新剧本
      const updatedScript = await ScriptModel.findByIdAndUpdate(
        id,
        {
          ...data,
          'metadata.updatedAt': new Date(),
          updatedBy: data.updatedBy
        },
        { new: true }
      );

      logger.info('剧本更新成功:', id);
      return updatedScript;
    } catch (error) {
      logger.error('剧本更新失败:', error);
      throw error;
    }
  }

  async deleteScript(id: string): Promise<void> {
    try {
      const script = await ScriptModel.findById(id);
      if (!script) {
        throw new ScriptNotFoundError(id);
      }

      // 软删除
      await ScriptModel.findByIdAndUpdate(id, {
        status: ScriptStatus.ARCHIVED,
        'metadata.updatedAt': new Date()
      });

      logger.info('剧本删除成功:', id);
    } catch (error) {
      logger.error('剧本删除失败:', error);
      throw error;
    }
  }

  async getScriptById(id: string): Promise<IScript> {
    try {
      const script = await ScriptModel.findOne({
        _id: id,
        status: { $ne: ScriptStatus.ARCHIVED }
      });

      if (!script) {
        throw new ScriptNotFoundError(id);
      }

      return script;
    } catch (error) {
      logger.error('获取剧本失败:', error);
      throw error;
    }
  }

  async getScriptList(query: {
    projectId: string;
    status?: ScriptStatus;
    difficulty?: ScriptDifficulty;
    tags?: string[];
    page?: number;
    limit?: number;
  }): Promise<{
    items: IScript[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    try {
      const {
        projectId,
        status,
        difficulty,
        tags,
        page = 1,
        limit = 10
      } = query;

      // 构建查询条件
      const filter: any = {
        projectId,
        status: status || { $ne: ScriptStatus.ARCHIVED }
      };

      if (difficulty) {
        filter.difficulty = difficulty;
      }

      if (tags && tags.length > 0) {
        filter.tags = { $all: tags };
      }

      // 执行查询
      const [items, total] = await Promise.all([
        ScriptModel.find(filter)
          .skip((page - 1) * limit)
          .limit(limit)
          .sort({ 'metadata.updatedAt': -1 }),
        ScriptModel.countDocuments(filter)
      ]);

      return {
        items,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('获取剧本列表失败:', error);
      throw error;
    }
  }

  async publishScript(id: string, updatedBy: string): Promise<IScript> {
    try {
      const script = await ScriptModel.findById(id);
      if (!script) {
        throw new ScriptNotFoundError(id);
      }

      // 更新状态为已发布
      const publishedScript = await ScriptModel.findByIdAndUpdate(
        id,
        {
          status: ScriptStatus.PUBLISHED,
          'metadata.publishedAt': new Date(),
          'metadata.updatedAt': new Date(),
          updatedBy
        },
        { new: true }
      );

      logger.info('剧本发布成功:', id);
      return publishedScript;
    } catch (error) {
      logger.error('剧本发布失败:', error);
      throw error;
    }
  }

  async updatePlayCount(id: string): Promise<void> {
    try {
      await ScriptModel.findByIdAndUpdate(id, {
        $inc: { 'metadata.playCount': 1 }
      });
    } catch (error) {
      logger.error('更新剧本游玩次数失败:', error);
      throw error;
    }
  }

  async updateRating(id: string, rating: number): Promise<void> {
    try {
      if (rating < 0 || rating > 5) {
        throw new ScriptValidationError('评分必须在0-5之间');
      }

      await ScriptModel.findByIdAndUpdate(id, {
        'metadata.rating': rating
      });
    } catch (error) {
      logger.error('更新剧本评分失败:', error);
      throw error;
    }
  }
} 