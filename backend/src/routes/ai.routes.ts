import { Router } from 'express';
import { aiController } from '../controllers/ai.controller';
import { auth } from '../middlewares/auth.middleware';

const router = Router();

// 应用认证中间件
router.use(auth);

// AI分析相关路由
router.post('/analyze-character', aiController.analyzeCharacter);
router.post('/generate-dialogue', aiController.generateDialogue);

export default router; 