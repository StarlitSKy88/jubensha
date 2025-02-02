import { Request, Response } from 'express'
import { TimelineService } from '../services/timeline.service'
import { ITimelineEvent } from '../models/timeline.model'

export class TimelineController {
  private timelineService: TimelineService

  constructor() {
    this.timelineService = new TimelineService()
  }

  // 获取时间线事件列表
  async getEvents(req: Request, res: Response) {
    try {
      const { projectId } = req.query
      const events = await this.timelineService.getEvents(projectId as string)
      res.json(events)
    } catch (error) {
      res.status(500).json({
        message: '获取时间线事件失败',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }

  // 获取单个时间线事件
  async getEvent(req: Request, res: Response) {
    try {
      const { id } = req.params
      const event = await this.timelineService.getEvent(id)
      
      if (!event) {
        return res.status(404).json({ message: '事件不存在' })
      }

      res.json(event)
    } catch (error) {
      res.status(500).json({
        message: '获取时间线事件失败',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }

  // 创建时间线事件
  async createEvent(req: Request, res: Response) {
    try {
      const eventData = req.body as Partial<ITimelineEvent>
      const event = await this.timelineService.createEvent(eventData)
      res.status(201).json(event)
    } catch (error) {
      res.status(500).json({
        message: '创建时间线事件失败',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }

  // 更新时间线事件
  async updateEvent(req: Request, res: Response) {
    try {
      const { id } = req.params
      const eventData = req.body as Partial<ITimelineEvent>
      const event = await this.timelineService.updateEvent(id, eventData)

      if (!event) {
        return res.status(404).json({ message: '事件不存在' })
      }

      res.json(event)
    } catch (error) {
      res.status(500).json({
        message: '更新时间线事件失败',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }

  // 删除时间线事件
  async deleteEvent(req: Request, res: Response) {
    try {
      const { id } = req.params
      const success = await this.timelineService.deleteEvent(id)

      if (!success) {
        return res.status(404).json({ message: '事件不存在' })
      }

      res.status(204).send()
    } catch (error) {
      res.status(500).json({
        message: '删除时间线事件失败',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }

  // 添加事件关联
  async addEventRelation(req: Request, res: Response) {
    try {
      const { id, relatedId } = req.params
      await this.timelineService.addEventRelation(id, relatedId)
      res.status(204).send()
    } catch (error) {
      res.status(500).json({
        message: '添加事件关联失败',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }

  // 移除事件关联
  async removeEventRelation(req: Request, res: Response) {
    try {
      const { id, relatedId } = req.params
      await this.timelineService.removeEventRelation(id, relatedId)
      res.status(204).send()
    } catch (error) {
      res.status(500).json({
        message: '移除事件关联失败',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }

  // 获取相关事件
  async getRelatedEvents(req: Request, res: Response) {
    try {
      const { id } = req.params
      const events = await this.timelineService.getRelatedEvents(id)
      res.json(events)
    } catch (error) {
      res.status(500).json({
        message: '获取相关事件失败',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }

  // 更新事件顺序
  async updateEventsOrder(req: Request, res: Response) {
    try {
      const events = req.body.events as Array<{ id: string; order: number }>
      await this.timelineService.updateEventsOrder(events)
      res.status(204).send()
    } catch (error) {
      res.status(500).json({
        message: '更新事件顺序失败',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }

  // 分析时间线
  async analyzeTimeline(req: Request, res: Response) {
    try {
      const { projectId } = req.query
      const analysis = await this.timelineService.analyzeTimeline(projectId as string)
      res.json(analysis)
    } catch (error) {
      res.status(500).json({
        message: '分析时间线失败',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }

  // 检查时间线一致性
  async checkConsistency(req: Request, res: Response) {
    try {
      const { projectId } = req.query
      const result = await this.timelineService.checkConsistency(projectId as string)
      res.json(result)
    } catch (error) {
      res.status(500).json({
        message: '检查时间线一致性失败',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }

  // 优化时间线节奏
  async optimizeTimeline(req: Request, res: Response) {
    try {
      const { projectId } = req.query
      const result = await this.timelineService.optimizeTimeline(projectId as string)
      res.json(result)
    } catch (error) {
      res.status(500).json({
        message: '优化时间线节奏失败',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }

  // 导出时间线
  async exportTimeline(req: Request, res: Response) {
    try {
      const { projectId } = req.query
      const events = await this.timelineService.exportTimeline(projectId as string)
      res.json(events)
    } catch (error) {
      res.status(500).json({
        message: '导出时间线失败',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }

  // 导入时间线
  async importTimeline(req: Request, res: Response) {
    try {
      const events = req.body.events as ITimelineEvent[]
      await this.timelineService.importTimeline(events)
      res.status(204).send()
    } catch (error) {
      res.status(500).json({
        message: '导入时间线失败',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }
} 