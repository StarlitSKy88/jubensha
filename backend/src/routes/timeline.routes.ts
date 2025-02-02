import { Router } from 'express'
import { TimelineController } from '../controllers/timeline.controller'

const router = Router()
const timelineController = new TimelineController()

// 基础 CRUD 路由
router.get('/events', timelineController.getEvents.bind(timelineController))
router.get('/events/:id', timelineController.getEvent.bind(timelineController))
router.post('/events', timelineController.createEvent.bind(timelineController))
router.put('/events/:id', timelineController.updateEvent.bind(timelineController))
router.delete('/events/:id', timelineController.deleteEvent.bind(timelineController))

// 事件关系路由
router.post('/events/:id/relations/:relatedId', timelineController.addEventRelation.bind(timelineController))
router.delete('/events/:id/relations/:relatedId', timelineController.removeEventRelation.bind(timelineController))
router.get('/events/:id/related', timelineController.getRelatedEvents.bind(timelineController))

// 事件顺序路由
router.put('/events/order', timelineController.updateEventsOrder.bind(timelineController))

// 分析和优化路由
router.get('/analysis', timelineController.analyzeTimeline.bind(timelineController))
router.get('/consistency', timelineController.checkConsistency.bind(timelineController))
router.get('/optimization', timelineController.optimizeTimeline.bind(timelineController))

// 导入导出路由
router.get('/export', timelineController.exportTimeline.bind(timelineController))
router.post('/import', timelineController.importTimeline.bind(timelineController))

export default router 