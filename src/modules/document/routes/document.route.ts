import { Router } from 'express';
import { DocumentController } from '../controllers/document.controller';
import { asyncHandler } from '../../../middlewares/async.middleware';
import { authMiddleware } from '../../../middlewares/auth.middleware';

const router = Router();
const documentController = new DocumentController();

// 应用认证中间件
router.use(authMiddleware);

// 文档路由
router.post('/', asyncHandler(documentController.create));
router.get('/', asyncHandler(documentController.list));
router.get('/:id', asyncHandler(documentController.get));
router.patch('/:id', asyncHandler(documentController.update));
router.delete('/:id', asyncHandler(documentController.delete));
router.get('/:id/versions', asyncHandler(documentController.getVersions));

export default router; 