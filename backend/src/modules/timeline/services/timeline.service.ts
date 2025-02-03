import { Types } from 'mongoose';
import { TimelineEvent, ITimelineEvent } from '../models/timeline.model';
import { 
  CreateTimelineEventDto, 
  UpdateTimelineEventDto,
  TimelineEventQueryDto,
  TimelineEventResponseDto
} from '../dtos/timeline.dto';
import { TimelineError } from '../errors/timeline.error';

export class TimelineService {
  /**
   * 创建时间线事件
   */
  async createEvent(
    userId: string,
    projectId: string,
    data: CreateTimelineEventDto
  ): Promise<ITimelineEvent> {
    try {
      const event = new TimelineEvent({
        ...data,
        creator: new Types.ObjectId(userId),
        projectId: new Types.ObjectId(projectId),
        characters: data.characters.map(id => new Types.ObjectId(id)),
        relatedEvents: data.relatedEvents?.map(id => new Types.ObjectId(id))
      });

      await event.save();
      return event;
    } catch (error) {
      throw new TimelineError('创建时间线事件失败', 500);
    }
  }

  /**
   * 获取时间线事件列表
   */
  async getEvents(
    userId: string,
    query: TimelineEventQueryDto
  ): Promise<{
    events: ITimelineEvent[];
    total: number;
  }> {
    try {
      const {
        projectId,
        startDate,
        endDate,
        characters,
        tags,
        importance,
        search,
        isPublic,
        page = 1,
        limit = 10,
        sortBy = 'date',
        sortOrder = 'asc'
      } = query;

      // 构建查询条件
      const filter: any = {
        projectId: new Types.ObjectId(projectId),
        $or: [
          { creator: new Types.ObjectId(userId) },
          { isPublic: true }
        ]
      };

      if (startDate) {
        filter.date = { $gte: new Date(startDate) };
      }

      if (endDate) {
        filter.date = { ...filter.date, $lte: new Date(endDate) };
      }

      if (characters?.length) {
        filter.characters = { 
          $in: characters.map(id => new Types.ObjectId(id)) 
        };
      }

      if (tags?.length) {
        filter.tags = { $in: tags };
      }

      if (importance) {
        filter.importance = importance;
      }

      if (search) {
        filter.$or = [
          { title: new RegExp(search, 'i') },
          { description: new RegExp(search, 'i') }
        ];
      }

      if (typeof isPublic === 'boolean') {
        filter.isPublic = isPublic;
      }

      // 计算总数
      const total = await TimelineEvent.countDocuments(filter);

      // 获取分页数据
      const events = await TimelineEvent.find(filter)
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('creator', 'username')
        .populate('characters', 'name')
        .populate('relatedEvents', 'title');

      return { events, total };
    } catch (error) {
      throw new TimelineError('获取时间线事件列表失败', 500);
    }
  }

  /**
   * 获取单个时间线事件
   */
  async getEvent(userId: string, eventId: string): Promise<ITimelineEvent> {
    const event = await TimelineEvent.findById(eventId)
      .populate('creator', 'username')
      .populate('characters', 'name')
      .populate('relatedEvents', 'title');

    if (!event) {
      throw new TimelineError('时间线事件不存在', 404);
    }

    if (!event.isPublic && event.creator.toString() !== userId) {
      throw new TimelineError('没有权限访问此事件', 403);
    }

    return event;
  }

  /**
   * 更新时间线事件
   */
  async updateEvent(
    userId: string,
    eventId: string,
    data: UpdateTimelineEventDto
  ): Promise<ITimelineEvent> {
    const event = await TimelineEvent.findById(eventId);

    if (!event) {
      throw new TimelineError('时间线事件不存在', 404);
    }

    if (event.creator.toString() !== userId) {
      throw new TimelineError('没有权限更新此事件', 403);
    }

    // 处理更新数据
    const { characters, relatedEvents, ...restData } = data;
    const updateData: Partial<ITimelineEvent> = { ...restData };
    
    // 处理关联ID
    if (characters) {
      updateData.characters = characters.map(id => new Types.ObjectId(id));
    }
    if (relatedEvents) {
      updateData.relatedEvents = relatedEvents.map(id => new Types.ObjectId(id));
    }

    const updatedEvent = await TimelineEvent.findByIdAndUpdate(
      eventId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('creator', 'username')
     .populate('characters', 'name')
     .populate('relatedEvents', 'title');

    if (!updatedEvent) {
      throw new TimelineError('更新时间线事件失败', 500);
    }

    return updatedEvent;
  }

  /**
   * 删除时间线事件
   */
  async deleteEvent(userId: string, eventId: string): Promise<void> {
    const event = await TimelineEvent.findById(eventId);

    if (!event) {
      throw new TimelineError('时间线事件不存在', 404);
    }

    if (event.creator.toString() !== userId) {
      throw new TimelineError('没有权限删除此事件', 403);
    }

    await event.deleteOne();
  }

  /**
   * 批量获取角色的时间线事件
   */
  async getCharacterEvents(
    userId: string,
    characterId: string,
    query: TimelineEventQueryDto
  ): Promise<{
    events: ITimelineEvent[];
    total: number;
  }> {
    try {
      const filter: any = {
        characters: new Types.ObjectId(characterId),
        $or: [
          { creator: new Types.ObjectId(userId) },
          { isPublic: true }
        ]
      };

      const total = await TimelineEvent.countDocuments(filter);
      const events = await TimelineEvent.find(filter)
        .sort({ date: 1 })
        .populate('creator', 'username')
        .populate('characters', 'name')
        .populate('relatedEvents', 'title');

      return { events, total };
    } catch (error) {
      throw new TimelineError('获取角色时间线事件失败', 500);
    }
  }
}

export const timelineService = new TimelineService(); 