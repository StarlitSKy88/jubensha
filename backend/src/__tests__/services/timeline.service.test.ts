import { TimelineService } from '../../services/timeline.service'
import { TimelineEvent, type ITimelineEvent } from '../../models/timeline.model'
import mongoose from 'mongoose'

describe('TimelineService', () => {
  let timelineService: TimelineService

  beforeEach(() => {
    timelineService = new TimelineService()
  })

  describe('CRUD Operations', () => {
    it('should create a timeline event', async () => {
      const eventData = {
        projectId: '123',
        title: '测试事件',
        description: '这是一个测试事件',
        type: 'major' as const,
        date: new Date(),
        importance: 3,
        status: 'draft' as const,
        characters: ['角色1', '角色2'],
        tags: ['标签1', '标签2']
      }

      const event = await timelineService.createEvent(eventData)

      expect(event).toBeDefined()
      expect(event.id).toBeDefined()
      expect(event.title).toBe(eventData.title)
      expect(event.description).toBe(eventData.description)
      expect(event.type).toBe(eventData.type)
      expect(event.importance).toBe(eventData.importance)
      expect(event.status).toBe(eventData.status)
      expect(event.characters).toEqual(eventData.characters)
      expect(event.tags).toEqual(eventData.tags)
    })

    it('should get a timeline event by id', async () => {
      const eventData = {
        projectId: '123',
        title: '测试事件',
        description: '这是一个测试事件',
        type: 'major' as const,
        date: new Date(),
        importance: 3,
        status: 'draft' as const
      }

      const createdEvent = await timelineService.createEvent(eventData)
      const event = await timelineService.getEvent(createdEvent.id)

      expect(event).toBeDefined()
      expect(event?.id).toBe(createdEvent.id)
      expect(event?.title).toBe(eventData.title)
    })

    it('should update a timeline event', async () => {
      const eventData = {
        projectId: '123',
        title: '测试事件',
        description: '这是一个测试事件',
        type: 'major' as const,
        date: new Date(),
        importance: 3,
        status: 'draft' as const
      }

      const createdEvent = await timelineService.createEvent(eventData)
      const updateData = {
        title: '更新的标题',
        description: '更新的描述'
      }

      const updatedEvent = await timelineService.updateEvent(createdEvent.id, updateData)

      expect(updatedEvent).toBeDefined()
      expect(updatedEvent?.title).toBe(updateData.title)
      expect(updatedEvent?.description).toBe(updateData.description)
    })

    it('should delete a timeline event', async () => {
      const eventData = {
        projectId: '123',
        title: '测试事件',
        description: '这是一个测试事件',
        type: 'major' as const,
        date: new Date(),
        importance: 3,
        status: 'draft' as const
      }

      const createdEvent = await timelineService.createEvent(eventData)
      const result = await timelineService.deleteEvent(createdEvent.id)

      expect(result).toBe(true)

      const event = await timelineService.getEvent(createdEvent.id)
      expect(event).toBeNull()
    })
  })

  describe('Event Relations', () => {
    it('should add and remove event relations', async () => {
      const event1 = await timelineService.createEvent({
        projectId: '123',
        title: '事件1',
        description: '描述1',
        type: 'major' as const,
        date: new Date(),
        importance: 3,
        status: 'draft' as const
      })

      const event2 = await timelineService.createEvent({
        projectId: '123',
        title: '事件2',
        description: '描述2',
        type: 'major' as const,
        date: new Date(),
        importance: 3,
        status: 'draft' as const
      })

      // 添加关联
      await timelineService.addEventRelation(event1.id, event2.id)
      let relatedEvents = await timelineService.getRelatedEvents(event1.id)
      expect(relatedEvents).toContainEqual(expect.objectContaining({ id: event2.id }))

      // 移除关联
      await timelineService.removeEventRelation(event1.id, event2.id)
      relatedEvents = await timelineService.getRelatedEvents(event1.id)
      expect(relatedEvents).not.toContainEqual(expect.objectContaining({ id: event2.id }))
    })
  })

  describe('Timeline Analysis', () => {
    it('should analyze timeline', async () => {
      // 创建一些测试事件
      await Promise.all([
        timelineService.createEvent({
          projectId: '123',
          title: '主要事件1',
          description: '描述1',
          type: 'major' as const,
          date: new Date('2024-01-01'),
          importance: 5,
          status: 'published' as const
        }),
        timelineService.createEvent({
          projectId: '123',
          title: '次要事件1',
          description: '描述2',
          type: 'minor' as const,
          date: new Date('2024-01-15'),
          importance: 3,
          status: 'published' as const
        }),
        timelineService.createEvent({
          projectId: '123',
          title: '背景事件1',
          description: '描述3',
          type: 'background' as const,
          date: new Date('2024-02-01'),
          importance: 2,
          status: 'published' as const
        })
      ])

      const analysis = await timelineService.analyzeTimeline('123')

      expect(analysis.totalEvents).toBe(3)
      expect(analysis.majorEvents).toBe(1)
      expect(analysis.minorEvents).toBe(1)
      expect(analysis.backgroundEvents).toBe(1)
      expect(analysis.phases).toBeDefined()
      expect(analysis.characterArcs).toBeDefined()
      expect(analysis.plotPoints).toBeDefined()
    })

    it('should check timeline consistency', async () => {
      // 创建一些可能不一致的事件
      await Promise.all([
        timelineService.createEvent({
          projectId: '123',
          title: '事件1',
          description: '描述1',
          type: 'major' as const,
          date: new Date('2024-02-01'),
          importance: 5,
          status: 'published' as const,
          order: 1
        }),
        timelineService.createEvent({
          projectId: '123',
          title: '事件2',
          description: '描述2',
          type: 'major' as const,
          date: new Date('2024-01-01'), // 时间早但顺序晚
          importance: 5,
          status: 'published' as const,
          order: 2
        })
      ])

      const result = await timelineService.checkConsistency('123')

      expect(result.issues).toBeDefined()
      expect(result.score).toBeDefined()
      expect(result.suggestions).toBeDefined()
      expect(result.issues.length).toBeGreaterThan(0)
    })

    it('should optimize timeline pacing', async () => {
      // 创建一些需要优化的事件
      await Promise.all([
        timelineService.createEvent({
          projectId: '123',
          title: '事件1',
          description: '描述1',
          type: 'major' as const,
          date: new Date('2024-01-01'),
          importance: 5,
          status: 'published' as const
        }),
        timelineService.createEvent({
          projectId: '123',
          title: '事件2',
          description: '描述2',
          type: 'major' as const,
          date: new Date('2024-01-02'),
          importance: 5,
          status: 'published' as const
        })
      ])

      const result = await timelineService.optimizeTimeline('123')

      expect(result.suggestions).toBeDefined()
      expect(result.currentPacing).toBeDefined()
      expect(result.recommendedChanges).toBeDefined()
    })
  })

  describe('Import/Export', () => {
    it('should export and import timeline', async () => {
      // 创建一些测试事件
      const events = await Promise.all([
        timelineService.createEvent({
          projectId: '123',
          title: '事件1',
          description: '描述1',
          type: 'major' as const,
          date: new Date(),
          importance: 5,
          status: 'published' as const
        }),
        timelineService.createEvent({
          projectId: '123',
          title: '事件2',
          description: '描述2',
          type: 'minor' as const,
          date: new Date(),
          importance: 3,
          status: 'published' as const
        })
      ])

      // 导出
      const exportedEvents = await timelineService.exportTimeline('123')
      expect(exportedEvents).toHaveLength(2)

      // 清空数据
      await mongoose.model<ITimelineEvent>('TimelineEvent').deleteMany({})

      // 导入
      await timelineService.importTimeline(exportedEvents)

      // 验证导入的数据
      const importedEvents = await timelineService.getEvents('123')
      expect(importedEvents).toHaveLength(2)
      expect(importedEvents[0].title).toBe(events[0].title)
      expect(importedEvents[1].title).toBe(events[1].title)
    })
  })
}) 