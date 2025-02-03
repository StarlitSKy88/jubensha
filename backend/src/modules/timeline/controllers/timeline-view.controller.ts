import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { timelineViewService } from '../services/timeline-view.service';
import { TimelineError } from '../errors/timeline.error';
import { successResponse, errorResponse } from '../../../utils/response';
import {
  CreateTimelineViewDto,
  UpdateTimelineViewDto,
  TimelineViewQueryDto
} from '../dtos/timeline-view.dto';

export class TimelineViewController {
  /**
   * 创建时间线视图
   */
  async createTimelineView(req: Request, res: Response): Promise<void> {
    try {
      const userId = new Types.ObjectId(req.user.id);
      const projectId = new Types.ObjectId(req.params.projectId);
      const data: CreateTimelineViewDto = req.body;

      const timelineView = await timelineViewService.createTimelineView(
        userId,
        projectId,
        data
      );

      res.status(201).json(successResponse('时间线视图创建成功', timelineView));
    } catch (error) {
      if (error instanceof TimelineError) {
        res.status(error.statusCode).json(errorResponse(error.message));
      } else {
        res.status(500).json(errorResponse('创建时间线视图失败'));
      }
    }
  }

  /**
   * 更新时间线视图
   */
  async updateTimelineView(req: Request, res: Response): Promise<void> {
    try {
      const userId = new Types.ObjectId(req.user.id);
      const viewId = new Types.ObjectId(req.params.viewId);
      const data: UpdateTimelineViewDto = req.body;

      const timelineView = await timelineViewService.updateTimelineView(
        userId,
        viewId,
        data
      );

      res.json(successResponse('时间线视图更新成功', timelineView));
    } catch (error) {
      if (error instanceof TimelineError) {
        res.status(error.statusCode).json(errorResponse(error.message));
      } else {
        res.status(500).json(errorResponse('更新时间线视图失败'));
      }
    }
  }

  /**
   * 获取时间线视图列表
   */
  async getTimelineViews(req: Request, res: Response): Promise<void> {
    try {
      const projectId = new Types.ObjectId(req.params.projectId);
      const query: TimelineViewQueryDto = {
        projectId,
        search: req.query.search as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        sortBy: req.query.sortBy as string,
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc'
      };

      const result = await timelineViewService.getTimelineViews(projectId, query);
      res.json(successResponse('获取时间线视图列表成功', result));
    } catch (error) {
      if (error instanceof TimelineError) {
        res.status(error.statusCode).json(errorResponse(error.message));
      } else {
        res.status(500).json(errorResponse('获取时间线视图列表失败'));
      }
    }
  }

  /**
   * 获取时间线视图详情
   */
  async getTimelineView(req: Request, res: Response): Promise<void> {
    try {
      const viewId = new Types.ObjectId(req.params.viewId);
      const withVisualization = req.query.visualization === 'true';

      const timelineView = await timelineViewService.getTimelineView(
        viewId,
        withVisualization
      );

      res.json(successResponse('获取时间线视图成功', timelineView));
    } catch (error) {
      if (error instanceof TimelineError) {
        res.status(error.statusCode).json(errorResponse(error.message));
      } else {
        res.status(500).json(errorResponse('获取时间线视图失败'));
      }
    }
  }

  /**
   * 删除时间线视图
   */
  async deleteTimelineView(req: Request, res: Response): Promise<void> {
    try {
      const userId = new Types.ObjectId(req.user.id);
      const viewId = new Types.ObjectId(req.params.viewId);

      await timelineViewService.deleteTimelineView(userId, viewId);
      res.json(successResponse('时间线视图删除成功'));
    } catch (error) {
      if (error instanceof TimelineError) {
        res.status(error.statusCode).json(errorResponse(error.message));
      } else {
        res.status(500).json(errorResponse('删除时间线视图失败'));
      }
    }
  }
}

export const timelineViewController = new TimelineViewController(); 