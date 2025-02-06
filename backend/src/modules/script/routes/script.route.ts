import { Router } from 'express';
import { scriptController } from '../controllers/script.controller';
import { authenticate } from '@middlewares/auth.middleware';
import { validate } from '@middlewares/validate.middleware';
import {
  createScriptSchema,
  updateScriptSchema,
  publishScriptSchema,
  rateScriptSchema,
  listScriptSchema
} from '../schemas/script.schema';

const router = Router({ mergeParams: true });

// 所有路由都需要认证
router.use(authenticate);

// 创建剧本
router.post(
  '/',
  validate(createScriptSchema),
  scriptController.createScript.bind(scriptController)
);

// 更新剧本
router.put(
  '/:id',
  validate(updateScriptSchema),
  scriptController.updateScript.bind(scriptController)
);

// 删除剧本
router.delete(
  '/:id',
  scriptController.deleteScript.bind(scriptController)
);

// 获取单个剧本
router.get(
  '/:id',
  scriptController.getScript.bind(scriptController)
);

// 获取剧本列表
router.get(
  '/',
  validate(listScriptSchema),
  scriptController.getScriptList.bind(scriptController)
);

// 发布剧本
router.post(
  '/:id/publish',
  validate(publishScriptSchema),
  scriptController.publishScript.bind(scriptController)
);

// 更新游玩次数
router.post(
  '/:id/play',
  scriptController.updatePlayCount.bind(scriptController)
);

// 评分
router.post(
  '/:id/rate',
  validate(rateScriptSchema),
  scriptController.updateRating.bind(scriptController)
);

export { router as scriptRouter }; 