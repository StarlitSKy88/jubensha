import { Router } from 'express';
import { timelineViewController } from '../controllers/timeline-view.controller';
import { authenticate } from '../../../middleware/auth';
import { validate } from '../../../middleware/validator';
import { timelineViewValidation } from '../validations/timeline-view.validation';
import { apiLimiter } from '../../../middleware/rateLimiter';

const router = Router();

// 应用认证和限流中间件
router.use(authenticate);
router.use(apiLimiter);

// 时间线视图路由
router.post(
  '/projects/:projectId/timeline-views',
  validate(timelineViewValidation.createTimelineView),
  timelineViewController.createTimelineView
);

router.get(
  '/projects/:projectId/timeline-views',
  validate(timelineViewValidation.getTimelineViews),
  timelineViewController.getTimelineViews
);

router.get(
  '/timeline-views/:viewId',
  validate(timelineViewValidation.getTimelineView),
  timelineViewController.getTimelineView
);

router.put(
  '/timeline-views/:viewId',
  validate(timelineViewValidation.updateTimelineView),
  timelineViewController.updateTimelineView
);

router.delete(
  '/timeline-views/:viewId',
  validate(timelineViewValidation.deleteTimelineView),
  timelineViewController.deleteTimelineView
);

export const timelineViewRoutes = router; 