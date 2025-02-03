import { Router } from 'express';
import { timelineController } from '../controllers/timeline.controller';
import { auth } from '../../auth/middlewares/auth.middleware';

const router = Router();

// 所有路由都需要认证
router.use(auth);

// 项目时间线路由
router.post('/projects/:projectId/events', timelineController.createEvent.bind(timelineController));
router.get('/projects/:projectId/events', timelineController.getEvents.bind(timelineController));
router.get('/projects/:projectId/events/:id', timelineController.getEvent.bind(timelineController));
router.put('/projects/:projectId/events/:id', timelineController.updateEvent.bind(timelineController));
router.delete('/projects/:projectId/events/:id', timelineController.deleteEvent.bind(timelineController));

// 角色时间线路由
router.get(
  '/projects/:projectId/characters/:characterId/events',
  timelineController.getCharacterEvents.bind(timelineController)
);

export const timelineRoutes = router; 