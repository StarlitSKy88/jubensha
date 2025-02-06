import { Router } from 'express';
import { DocumentController } from '../controllers/document.controller';
import { authMiddleware } from '../middleware/auth';
import { validateSchema } from '../middleware/validator';
import { documentSchema } from '../validations/document.schema';

const router = Router();
const documentController = new DocumentController();

// 创建文档
router.post(
  '/',
  authMiddleware,
  validateSchema(documentSchema.create),
  documentController.createDocument.bind(documentController)
);

// 获取文档列表
router.get(
  '/',
  authMiddleware,
  validateSchema(documentSchema.query),
  documentController.getDocuments.bind(documentController)
);

// 获取文档详情
router.get(
  '/:id',
  authMiddleware,
  documentController.getDocument.bind(documentController)
);

// 更新文档
router.put(
  '/:id',
  authMiddleware,
  validateSchema(documentSchema.update),
  documentController.updateDocument.bind(documentController)
);

// 删除文档
router.delete(
  '/:id',
  authMiddleware,
  documentController.deleteDocument.bind(documentController)
);

// 获取文档版本历史
router.get(
  '/:id/versions',
  authMiddleware,
  documentController.getDocumentVersions.bind(documentController)
);

export default router; 