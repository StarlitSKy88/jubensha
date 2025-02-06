import { Router } from 'express';
import { DocumentController } from '../controllers/document.controller';
import { auth } from '@middlewares/auth.middleware';
import { asyncHandler } from '@middlewares/async.middleware';

const router = Router();
const documentController = new DocumentController();

// 创建文档
router.post(
  '/',
  auth,
  asyncHandler(documentController.createDocument)
);

// 更新文档
router.put(
  '/:id',
  auth,
  asyncHandler(documentController.updateDocument)
);

// 获取文档
router.get(
  '/:id',
  auth,
  asyncHandler(documentController.getDocument)
);

// 获取文档列表
router.get(
  '/',
  auth,
  asyncHandler(documentController.getDocuments)
);

// 删除文档
router.delete(
  '/:id',
  auth,
  asyncHandler(documentController.deleteDocument)
);

// 获取文档版本历史
router.get(
  '/:id/versions',
  auth,
  asyncHandler(documentController.getDocumentVersions)
);

// 恢复到指定版本
router.post(
  '/:id/restore',
  auth,
  asyncHandler(documentController.restoreVersion)
);

export default router; 