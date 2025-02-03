import { Router } from 'express';
import { knowledgeController } from '../controllers/knowledge.controller';
import { auth } from '../../auth/middlewares/auth.middleware';

const router = Router();

// 所有路由都需要认证
router.use(auth);

// 知识库路由
router.post('/projects/:projectId/knowledge', knowledgeController.createKnowledge.bind(knowledgeController));
router.post('/projects/:projectId/knowledge/search', knowledgeController.searchKnowledge.bind(knowledgeController));
router.post('/projects/:projectId/knowledge/bulk-import', knowledgeController.bulkImport.bind(knowledgeController));
router.put('/projects/:projectId/knowledge/:id', knowledgeController.updateKnowledge.bind(knowledgeController));
router.delete('/projects/:projectId/knowledge/:id', knowledgeController.deleteKnowledge.bind(knowledgeController));

export const knowledgeRoutes = router; 