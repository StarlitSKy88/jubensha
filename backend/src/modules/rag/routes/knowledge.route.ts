import { Router } from 'express';
import { knowledgeController } from '../controllers/knowledge.controller';
import { authenticate } from '@middlewares/auth.middleware';
import { validate } from '@middlewares/validate.middleware';
import { 
  createKnowledgeSchema,
  updateKnowledgeSchema,
  searchKnowledgeSchema,
  bulkImportSchema
} from '../schemas/knowledge.schema';

const router = Router({ mergeParams: true });

// 所有路由都需要认证
router.use(authenticate);

// 创建知识
router.post(
  '/',
  validate(createKnowledgeSchema),
  knowledgeController.createKnowledge.bind(knowledgeController)
);

// 更新知识
router.put(
  '/:id',
  validate(updateKnowledgeSchema),
  knowledgeController.updateKnowledge.bind(knowledgeController)
);

// 删除知识
router.delete(
  '/:id',
  knowledgeController.deleteKnowledge.bind(knowledgeController)
);

// 搜索知识
router.post(
  '/search',
  validate(searchKnowledgeSchema),
  knowledgeController.searchKnowledge.bind(knowledgeController)
);

// 获取单个知识
router.get(
  '/:id',
  knowledgeController.getKnowledge.bind(knowledgeController)
);

// 获取知识列表
router.get(
  '/',
  knowledgeController.getKnowledgeList.bind(knowledgeController)
);

// 批量导入知识
router.post(
  '/bulk',
  validate(bulkImportSchema),
  knowledgeController.bulkImport.bind(knowledgeController)
);

export { router as knowledgeRouter }; 