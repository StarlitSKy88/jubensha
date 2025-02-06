import { Router } from 'express';
import { DocumentController } from '@controllers/document.controller';
import { authMiddleware } from '@middlewares/auth.middleware';
import { validate } from '@middlewares/validate.middleware';
import { documentSchema } from '@validations/document.schema';

const router = Router();
const documentController = new DocumentController();

// 创建文档
router.post(
  '/',
  authMiddleware,
  validate(documentSchema.create),
  documentController.createDocument.bind(documentController)
);

// 获取文档列表
router.get(
  '/',
  authMiddleware,
  validate(documentSchema.query),
  documentController.getDocuments.bind(documentController)
);

// 获取文档详情
router.get(
  '/:id',
  authMiddleware,
  validate(documentSchema.params),
  documentController.getDocument.bind(documentController)
);

// 更新文档
router.put(
  '/:id',
  authMiddleware,
  validate(documentSchema.update),
  documentController.updateDocument.bind(documentController)
);

// 删除文档
router.delete(
  '/:id',
  authMiddleware,
  validate(documentSchema.params),
  documentController.deleteDocument.bind(documentController)
);

// 获取文档版本历史
router.get(
  '/:id/versions',
  authMiddleware,
  validate(documentSchema.params),
  documentController.getDocumentVersions.bind(documentController)
);

export default router; 