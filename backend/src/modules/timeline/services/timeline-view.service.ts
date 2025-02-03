import { Types, SortOrder } from 'mongoose';
import { TimelineView, ITimelineView } from '../models/timeline-view.model';
import { TimelineEvent, ITimelineEvent } from '../models/timeline-event.model';
import { Character } from '../../character/models/character.model';
import {
  CreateTimelineViewDto,
  UpdateTimelineViewDto,
  TimelineViewQueryDto,
  TimelineVisualizationData,
  TimelineEventNode,
  TimelineConnection
} from '../dtos/timeline-view.dto';
import { TimelineError } from '../errors/timeline.error';
import { cacheService } from '../../../services/cache.service';
import { logger } from '../../../utils/logger';

export class TimelineViewService {
  /**
   * 创建时间线视图
   */
  async createTimelineView(
    userId: Types.ObjectId,
    projectId: Types.ObjectId,
    data: CreateTimelineViewDto
  ): Promise<ITimelineView> {
    try {
      // 检查同名视图
      const existingView = await TimelineView.findOne({
        projectId,
        name: data.name
      });

      if (existingView) {
        throw new TimelineError('视图名称已存在', 400);
      }

      // 创建视图
      const timelineView = new TimelineView({
        ...data,
        projectId,
        createdBy: userId
      });

      await timelineView.save();
      return timelineView;
    } catch (error) {
      logger.error('创建时间线视图失败:', error);
      throw error instanceof TimelineError
        ? error
        : new TimelineError('创建时间线视图失败', 500);
    }
  }

  /**
   * 更新时间线视图
   */
  async updateTimelineView(
    userId: Types.ObjectId,
    viewId: Types.ObjectId,
    data: UpdateTimelineViewDto
  ): Promise<ITimelineView> {
    try {
      const timelineView = await TimelineView.findOne({
        _id: viewId,
        createdBy: userId
      });

      if (!timelineView) {
        throw new TimelineError('时间线视图不存在', 404);
      }

      // 检查同名视图
      if (data.name && data.name !== timelineView.name) {
        const existingView = await TimelineView.findOne({
          projectId: timelineView.projectId,
          name: data.name,
          _id: { $ne: viewId }
        });

        if (existingView) {
          throw new TimelineError('视图名称已存在', 400);
        }
      }

      // 更新视图
      Object.assign(timelineView, data);
      await timelineView.save();

      // 清除缓存
      await this.clearViewCache(viewId);

      return timelineView;
    } catch (error) {
      logger.error('更新时间线视图失败:', error);
      throw error instanceof TimelineError
        ? error
        : new TimelineError('更新时间线视图失败', 500);
    }
  }

  /**
   * 获取时间线视图列表
   */
  async getTimelineViews(
    projectId: Types.ObjectId,
    query: TimelineViewQueryDto
  ) {
    try {
      const {
        search,
        page = 1,
        limit = 10,
        sortBy = 'updatedAt',
        sortOrder = 'desc'
      } = query;

      // 构建查询条件
      const filter: any = { projectId };
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      // 执行查询
      const skip = (page - 1) * limit;
      const sortOptions: { [key: string]: SortOrder } = {
        [sortBy]: sortOrder === 'desc' ? -1 : 1
      };

      const [views, total] = await Promise.all([
        TimelineView.find(filter)
          .sort(sortOptions)
          .skip(skip)
          .limit(limit)
          .lean(),
        TimelineView.countDocuments(filter)
      ]);

      return {
        views,
        pagination: {
          total,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
          limit
        }
      };
    } catch (error) {
      logger.error('获取时间线视图列表失败:', error);
      throw new TimelineError('获取时间线视图列表失败', 500);
    }
  }

  /**
   * 获取时间线视图详情
   */
  async getTimelineView(
    viewId: Types.ObjectId,
    withVisualization: boolean = false
  ): Promise<ITimelineView & { visualization?: TimelineVisualizationData }> {
    try {
      // 尝试从缓存获取
      const cacheKey = `timeline:view:${viewId}`;
      const cachedView = await cacheService.get(cacheKey);
      if (cachedView) {
        return cachedView;
      }

      // 获取视图数据
      const timelineView = await TimelineView.findById(viewId).lean();
      if (!timelineView) {
        throw new TimelineError('时间线视图不存在', 404);
      }

      // 如果需要可视化数据
      if (withVisualization) {
        const visualization = await this.generateVisualization(timelineView);
        const result = { ...timelineView, visualization };

        // 缓存结果
        await cacheService.set(cacheKey, result, 3600);
        return result;
      }

      return timelineView;
    } catch (error) {
      logger.error('获取时间线视图详情失败:', error);
      throw error instanceof TimelineError
        ? error
        : new TimelineError('获取时间线视图详情失败', 500);
    }
  }

  /**
   * 删除时间线视图
   */
  async deleteTimelineView(
    userId: Types.ObjectId,
    viewId: Types.ObjectId
  ): Promise<void> {
    try {
      const result = await TimelineView.deleteOne({
        _id: viewId,
        createdBy: userId
      });

      if (result.deletedCount === 0) {
        throw new TimelineError('时间线视图不存在或无权删除', 404);
      }

      // 清除缓存
      await this.clearViewCache(viewId);
    } catch (error) {
      logger.error('删除时间线视图失败:', error);
      throw error instanceof TimelineError
        ? error
        : new TimelineError('删除时间线视图失败', 500);
    }
  }

  /**
   * 生成时间线可视化数据
   */
  private async generateVisualization(
    view: ITimelineView
  ): Promise<TimelineVisualizationData> {
    try {
      // 构建查询条件
      const filter: any = { projectId: view.projectId };

      // 应用过滤器
      if (view.filters) {
        if (view.filters.startDate) {
          filter.date = { $gte: view.filters.startDate };
        }
        if (view.filters.endDate) {
          filter.date = { ...filter.date, $lte: view.filters.endDate };
        }
        if (view.filters.characters?.length) {
          filter['characters.character'] = { $in: view.filters.characters };
        }
        if (view.filters.tags?.length) {
          filter.tags = { $in: view.filters.tags };
        }
        if (view.filters.eventTypes?.length) {
          filter.type = { $in: view.filters.eventTypes };
        }
      }

      // 获取事件数据
      const events = await TimelineEvent.find(filter)
        .populate('characters.character', 'name')
        .sort({ date: view.display.sortOrder === 'desc' ? -1 : 1 })
        .lean();

      // 转换为节点数据
      const nodes: TimelineEventNode[] = events.map((event: ITimelineEvent) => ({
        id: event._id,
        title: event.title,
        date: event.date,
        type: event.type,
        importance: event.importance,
        characters: event.characters.map((char: { character: { _id: Types.ObjectId; name: string }; role: string }) => ({
          id: char.character._id,
          name: char.character.name,
          role: char.role
        })),
        tags: event.tags,
        description: event.description,
        location: event.location
      }));

      // 生成连接数据
      const connections: TimelineConnection[] = [];
      for (let i = 0; i < events.length - 1; i++) {
        if (events[i].relatedEvents?.includes(events[i + 1]._id)) {
          connections.push({
            source: events[i]._id,
            target: events[i + 1]._id,
            type: 'sequential'
          });
        }
      }

      // 计算元数据
      const metadata = {
        totalEvents: events.length,
        dateRange: {
          start: events[0]?.date,
          end: events[events.length - 1]?.date
        },
        characterCount: new Set(
          events.flatMap((e: ITimelineEvent) =>
            e.characters.map((c: { character: { _id: Types.ObjectId } }) =>
              c.character._id.toString()
            )
          )
        ).size,
        eventTypeStats: events.reduce((stats: { [key: string]: number }, event: ITimelineEvent) => {
          stats[event.type] = (stats[event.type] || 0) + 1;
          return stats;
        }, {})
      };

      return { nodes, connections, metadata };
    } catch (error) {
      logger.error('生成时间线可视化数据失败:', error);
      throw new TimelineError('生成时间线可视化数据失败', 500);
    }
  }

  /**
   * 清除视图缓存
   */
  private async clearViewCache(viewId: Types.ObjectId): Promise<void> {
    try {
      await cacheService.del(`timeline:view:${viewId}`);
    } catch (error) {
      logger.error('清除视图缓存失败:', error);
    }
  }
}

export const timelineViewService = new TimelineViewService(); 