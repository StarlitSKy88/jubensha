import { Request, Response } from 'express'
import { TimelineService } from '../services/timeline.service'
import { ITimelineEvent } from '../models/timeline.model'
import { BusinessError } from '../utils/errors'

export class TimelineController {
  private timelineService: TimelineService

  constructor() {
    this.timelineService = new TimelineService()
  }

  /**
   * 获取时间线事件列表
   */
  async getEvents(req: Request, res: Response) {
    try {
      const { projectId } = req.query
      const events = await this.timelineService.getEvents(projectId as string)
      res.json({
        message: '获取成功',
        data: events
      })
    } catch (error) {
      if (error instanceof BusinessError) {
        res.status(error.status).json({
          code: error.code,
          message: error.message
        })
      } else {
        res.status(500).json({
          code: 'INTERNAL_ERROR',
          message: '服务器内部错误'
        })
      }
    }
  }

  /**
   * 获取单个事件
   */
  async getEvent(req: Request, res: Response) {
    try {
      const { id } = req.params
      const event = await this.timelineService.getEvent(id)

      if (!event) {
        throw new BusinessError('NOT_FOUND', '事件不存在', 404)
      }

      res.json({
        message: '获取成功',
        data: event
      })
    } catch (error) {
      if (error instanceof BusinessError) {
        res.status(error.status).json({
          code: error.code,
          message: error.message
        })
      } else {
        res.status(500).json({
          code: 'INTERNAL_ERROR',
          message: '服务器内部错误'
        })
      }
    }
  }

  /**
   * 创建事件
   */
  async createEvent(req: Request, res: Response) {
    try {
      const event = await this.timelineService.createEvent(req.body)
      res.status(201).json({
        message: '创建成功',
        data: event
      })
    } catch (error) {
      if (error instanceof BusinessError) {
        res.status(error.status).json({
          code: error.code,
          message: error.message
        })
      } else {
        res.status(500).json({
          code: 'INTERNAL_ERROR',
          message: '服务器内部错误'
        })
      }
    }
  }

  /**
   * 更新事件
   */
  async updateEvent(req: Request, res: Response) {
    try {
      const { id } = req.params
      const event = await this.timelineService.updateEvent(id, req.body)

      if (!event) {
        throw new BusinessError('NOT_FOUND', '事件不存在', 404)
      }

      res.json({
        message: '更新成功',
        data: event
      })
    } catch (error) {
      if (error instanceof BusinessError) {
        res.status(error.status).json({
          code: error.code,
          message: error.message
        })
      } else {
        res.status(500).json({
          code: 'INTERNAL_ERROR',
          message: '服务器内部错误'
        })
      }
    }
  }

  /**
   * 删除事件
   */
  async deleteEvent(req: Request, res: Response) {
    try {
      const { id } = req.params
      const success = await this.timelineService.deleteEvent(id)

      if (!success) {
        throw new BusinessError('NOT_FOUND', '事件不存在', 404)
      }

      res.json({
        message: '删除成功'
      })
    } catch (error) {
      if (error instanceof BusinessError) {
        res.status(error.status).json({
          code: error.code,
          message: error.message
        })
      } else {
        res.status(500).json({
          code: 'INTERNAL_ERROR',
          message: '服务器内部错误'
        })
      }
    }
  }

  /**
   * 获取相关事件
   */
  async getRelatedEvents(req: Request, res: Response) {
    try {
      const { id } = req.params
      const events = await this.timelineService.getRelatedEvents(id)
      res.json({
        message: '获取成功',
        data: events
      })
    } catch (error) {
      if (error instanceof BusinessError) {
        res.status(error.status).json({
          code: error.code,
          message: error.message
        })
      } else {
        res.status(500).json({
          code: 'INTERNAL_ERROR',
          message: '服务器内部错误'
        })
      }
    }
  }

  /**
   * 添加事件关联
   */
  async addEventRelation(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { relatedEventId } = req.body

      if (!relatedEventId) {
        throw new BusinessError('VALIDATION_ERROR', 'relatedEventId 为必填项', 400)
      }

      await this.timelineService.addEventRelation(id, relatedEventId)
      res.json({
        message: '添加成功'
      })
    } catch (error) {
      if (error instanceof BusinessError) {
        res.status(error.status).json({
          code: error.code,
          message: error.message
        })
      } else {
        res.status(500).json({
          code: 'INTERNAL_ERROR',
          message: '服务器内部错误'
        })
      }
    }
  }

  /**
   * 删除事件关联
   */
  async removeEventRelation(req: Request, res: Response) {
    try {
      const { id, relatedEventId } = req.params
      await this.timelineService.removeEventRelation(id, relatedEventId)
      res.json({
        message: '删除成功'
      })
    } catch (error) {
      if (error instanceof BusinessError) {
        res.status(error.status).json({
          code: error.code,
          message: error.message
        })
      } else {
        res.status(500).json({
          code: 'INTERNAL_ERROR',
          message: '服务器内部错误'
        })
      }
    }
  }

  /**
   * 更新事件顺序
   */
  async updateEventsOrder(req: Request, res: Response) {
    try {
      const { events } = req.body

      if (!Array.isArray(events)) {
        throw new BusinessError('VALIDATION_ERROR', 'events 必须是数组', 400)
      }

      await this.timelineService.updateEventsOrder(events)
      res.json({
        message: '更新成功'
      })
    } catch (error) {
      if (error instanceof BusinessError) {
        res.status(error.status).json({
          code: error.code,
          message: error.message
        })
      } else {
        res.status(500).json({
          code: 'INTERNAL_ERROR',
          message: '服务器内部错误'
        })
      }
    }
  }

  /**
   * 分析时间线
   */
  async analyzeTimeline(req: Request, res: Response) {
    try {
      const { projectId } = req.query
      const analysis = await this.timelineService.analyzeTimeline(projectId as string)
      res.json({
        message: '分析成功',
        data: analysis
      })
    } catch (error) {
      if (error instanceof BusinessError) {
        res.status(error.status).json({
          code: error.code,
          message: error.message
        })
      } else {
        res.status(500).json({
          code: 'INTERNAL_ERROR',
          message: '服务器内部错误'
        })
      }
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