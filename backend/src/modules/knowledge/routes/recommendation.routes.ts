import { Router } from 'express';
import { recommendationController } from '../controllers/recommendation.controller';
import { authenticate, authorize } from '../../../middlewares/auth.middleware';
import { rateLimitMiddleware } from '../../../middlewares/rate-limit.middleware';
import { recommendationValidation } from '../validations/recommendation.validation';
import { validate } from '../../../middlewares/validate.middleware';

const router = Router();

// 应用认证和速率限制中间件
router.use(authenticate);
router.use(authorize);
router.use(rateLimitMiddleware);

// 获取知识推荐
router.get(
  '/:knowledgeId/recommendations',
  validate(recommendationValidation.getRecommendations),
  recommendationController.getRecommendations
);

// 刷新知识推荐
router.post(
  '/:knowledgeId/recommendations/refresh',
  validate(recommendationValidation.refreshRecommendations),
  recommendationController.refreshRecommendations
);

// 获取相似知识
router.post(
  '/similar',
  validate(recommendationValidation.getSimilarKnowledge),
  recommendationController.getSimilarKnowledge
);

export { router as recommendationRoutes }; 