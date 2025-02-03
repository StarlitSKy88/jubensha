import { Request, Response, NextFunction } from 'express';
import { timelineService } from '../services/timeline.service';
import { 
  CreateTimelineEventDto, 
  UpdateTimelineEventDto,
  TimelineEventQueryDto 
} from '../dtos/timeline.dto';
import { TimelineError } from '../errors/timeline.error';

export class TimelineController {
  /**
   * 创建时间线事件
   */
  async createEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?._id;
      const projectId = req.params.projectId;
      const eventData: CreateTimelineEventDto = req.body;
      
      const event = await timelineService.createEvent(userId, projectId, eventData);
      
      res.status(201).json({
        success: true,
        data: event
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取时间线事件列表
   */
  async getEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?._id;
      const query: TimelineEventQueryDto = {
        ...req.query,
        projectId: req.params.projectId
      };
      
      const result = await timelineService.getEvents(userId, query);
      
      res.status(200).json({
        success: true,
        data: result.events,
        pagination: {
          total: result.total,
          page: Number(query.page) || 1,
          limit: Number(query.limit) || 10
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取单个时间线事件
   */
  async getEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?._id;
      const eventId = req.params.id;
      
      const event = await timelineService.getEvent(userId, eventId);
      
      res.status(200).json({
        success: true,
        data: event
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新时间线事件
   */
  async updateEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?._id;
      const eventId = req.params.id;
      const updateData: UpdateTimelineEventDto = req.body;
      
      const event = await timelineService.updateEvent(userId, eventId, updateData);
      
      res.status(200).json({
        success: true,
        data: event
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除时间线事件
   */
  async deleteEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?._id;
      const eventId = req.params.id;
      
      await timelineService.deleteEvent(userId, eventId);
      
      res.status(200).json({
        success: true,
        message: '时间线事件已成功删除'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取角色的时间线事件
   */
  async getCharacterEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?._id;
      const characterId = req.params.characterId;
      const query: TimelineEventQueryDto = {
        ...req.query,
        projectId: req.params.projectId
      };
      
      const result = await timelineService.getCharacterEvents(
        userId,
        characterId,
        query
      );
      
      res.status(200).json({
        success: true,
        data: result.events,
        pagination: {
          total: result.total
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

export const timelineController = new TimelineController(); 