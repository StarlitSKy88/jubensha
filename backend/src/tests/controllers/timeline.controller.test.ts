import request from 'supertest'
import { Express } from 'express'
import { createApp } from '../../app'
import { TimelineEvent, type ITimelineEvent } from '../../models/timeline.model'
import mongoose from 'mongoose'

describe('TimelineController', () => {
  let app: Express

  beforeAll(async () => {
    app = await createApp()
  })

  describe('CRUD Endpoints', () => {
    it('should create a timeline event', async () => {
      const eventData = {
        projectId: '123',
        title: '测试事件',
        description: '这是一个测试事件',
        type: 'major',
        date: new Date(),
        importance: 3,
        status: 'draft',
        characters: ['角色1', '角色2'],
        tags: ['标签1', '标签2']
      }

      const response = await request(app)
        .post('/api/timeline/events')
        .send(eventData)
        .expect(201)

      expect(response.body).toBeDefined()
      expect(response.body.id).toBeDefined()
      expect(response.body.title).toBe(eventData.title)
      expect(response.body.description).toBe(eventData.description)
      expect(response.body.type).toBe(eventData.type)
      expect(response.body.importance).toBe(eventData.importance)
      expect(response.body.status).toBe(eventData.status)
      expect(response.body.characters).toEqual(eventData.characters)
      expect(response.body.tags).toEqual(eventData.tags)
    })

    it('should get a timeline event by id', async () => {
      // 创建测试事件
      const event = await mongoose.model<ITimelineEvent>('TimelineEvent').create({
        projectId: '123',
        title: '测试事件',
        description: '这是一个测试事件',
        type: 'major',
        date: new Date(),
        importance: 3,
        status: 'draft'
      })

      const response = await request(app)
        .get(`/api/timeline/events/${event.id}`)
        .expect(200)

      expect(response.body).toBeDefined()
      expect(response.body.id).toBe(event.id)
      expect(response.body.title).toBe(event.title)
    })

    it('should update a timeline event', async () => {
      // 创建测试事件
      const event = await mongoose.model<ITimelineEvent>('TimelineEvent').create({
        projectId: '123',
        title: '测试事件',
        description: '这是一个测试事件',
        type: 'major',
        date: new Date(),
        importance: 3,
        status: 'draft'
      })

      const updateData = {
        title: '更新的标题',
        description: '更新的描述'
      }

      const response = await request(app)
        .put(`/api/timeline/events/${event.id}`)
        .send(updateData)
        .expect(200)

      expect(response.body).toBeDefined()
      expect(response.body.title).toBe(updateData.title)
      expect(response.body.description).toBe(updateData.description)
    })

    it('should delete a timeline event', async () => {
      // 创建测试事件
      const event = await mongoose.model<ITimelineEvent>('TimelineEvent').create({
        projectId: '123',
        title: '测试事件',
        description: '这是一个测试事件',
        type: 'major',
        date: new Date(),
        importance: 3,
        status: 'draft'
      })

      await request(app)
        .delete(`/api/timeline/events/${event.id}`)
        .expect(204)

      const deletedEvent = await mongoose.model<ITimelineEvent>('TimelineEvent').findById(event.id)
      expect(deletedEvent).toBeNull()
    })
  })

  describe('Event Relations Endpoints', () => {
    it('should add and remove event relations', async () => {
      // 创建两个测试事件
      const event1 = await mongoose.model<ITimelineEvent>('TimelineEvent').create({
        projectId: '123',
        title: '事件1',
        description: '描述1',
        type: 'major',
        date: new Date(),
        importance: 3,
        status: 'draft'
      })

      const event2 = await mongoose.model<ITimelineEvent>('TimelineEvent').create({
        projectId: '123',
        title: '事件2',
        description: '描述2',
        type: 'major',
        date: new Date(),
        importance: 3,
        status: 'draft'
      })

      // 添加关联
      await request(app)
        .post(`/api/timeline/events/${event1.id}/relations/${event2.id}`)
        .expect(204)

      // 验证关联
      const response = await request(app)
        .get(`/api/timeline/events/${event1.id}/related`)
        .expect(200)

      expect(response.body).toContainEqual(expect.objectContaining({ id: event2.id }))

      // 移除关联
      await request(app)
        .delete(`/api/timeline/events/${event1.id}/relations/${event2.id}`)
        .expect(204)

      // 验证关联已移除
      const responseAfterDelete = await request(app)
        .get(`/api/timeline/events/${event1.id}/related`)
        .expect(200)

      expect(responseAfterDelete.body).not.toContainEqual(expect.objectContaining({ id: event2.id }))
    })
  })

  describe('Analysis Endpoints', () => {
    beforeEach(async () => {
      // 创建测试事件
      await Promise.all([
        mongoose.model<ITimelineEvent>('TimelineEvent').create({
          projectId: '123',
          title: '主要事件1',
          description: '描述1',
          type: 'major',
          date: new Date('2024-01-01'),
          importance: 5,
          status: 'published'
        }),
        mongoose.model<ITimelineEvent>('TimelineEvent').create({
          projectId: '123',
          title: '次要事件1',
          description: '描述2',
          type: 'minor',
          date: new Date('2024-01-15'),
          importance: 3,
          status: 'published'
        }),
        mongoose.model<ITimelineEvent>('TimelineEvent').create({
          projectId: '123',
          title: '背景事件1',
          description: '描述3',
          type: 'background',
          date: new Date('2024-02-01'),
          importance: 2,
          status: 'published'
        })
      ])
    })

    it('should analyze timeline', async () => {
      const response = await request(app)
        .get('/api/timeline/analysis')
        .query({ projectId: '123' })
        .expect(200)

      expect(response.body.totalEvents).toBe(3)
      expect(response.body.majorEvents).toBe(1)
      expect(response.body.minorEvents).toBe(1)
      expect(response.body.backgroundEvents).toBe(1)
      expect(response.body.phases).toBeDefined()
      expect(response.body.characterArcs).toBeDefined()
      expect(response.body.plotPoints).toBeDefined()
    })

    it('should check timeline consistency', async () => {
      const response = await request(app)
        .get('/api/timeline/consistency')
        .query({ projectId: '123' })
        .expect(200)

      expect(response.body.issues).toBeDefined()
      expect(response.body.score).toBeDefined()
      expect(response.body.suggestions).toBeDefined()
    })

    it('should optimize timeline pacing', async () => {
      const response = await request(app)
        .get('/api/timeline/optimization')
        .query({ projectId: '123' })
        .expect(200)

      expect(response.body.suggestions).toBeDefined()
      expect(response.body.currentPacing).toBeDefined()
      expect(response.body.recommendedChanges).toBeDefined()
    })
  })

  describe('Import/Export Endpoints', () => {
    it('should export and import timeline', async () => {
      // 创建测试事件
      await Promise.all([
        mongoose.model<ITimelineEvent>('TimelineEvent').create({
          projectId: '123',
          title: '事件1',
          description: '描述1',
          type: 'major',
          date: new Date(),
          importance: 5,
          status: 'published'
        }),
        mongoose.model<ITimelineEvent>('TimelineEvent').create({
          projectId: '123',
          title: '事件2',
          description: '描述2',
          type: 'minor',
          date: new Date(),
          importance: 3,
          status: 'published'
        })
      ])

      // 导出
      const exportResponse = await request(app)
        .get('/api/timeline/export')
        .query({ projectId: '123' })
        .expect(200)

      expect(exportResponse.body).toHaveLength(2)

      // 清空数据
      await mongoose.model<ITimelineEvent>('TimelineEvent').deleteMany({})

      // 导入
      await request(app)
        .post('/api/timeline/import')
        .send({ events: exportResponse.body })
        .expect(204)

      // 验证导入的数据
      const importedEvents = await mongoose.model<ITimelineEvent>('TimelineEvent').find({ projectId: '123' })
      expect(importedEvents).toHaveLength(2)
      expect(importedEvents[0].title).toBe('事件1')
      expect(importedEvents[1].title).toBe('事件2')
    })
  })
}) 