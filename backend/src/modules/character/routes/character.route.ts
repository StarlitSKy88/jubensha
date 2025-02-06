import { Router } from 'express';
import { characterController } from '../controllers/character.controller';
import { authMiddleware } from '@middlewares/auth.middleware';
import { validateZod } from '@middlewares/validate.middleware';
import {
  createCharacterSchema,
  updateCharacterSchema,
  deleteCharacterSchema,
  getCharacterSchema,
  listCharacterSchema,
  addRelationshipSchema,
  removeRelationshipSchema
} from '../schemas/character.schema';

const router = Router({ mergeParams: true });

// 所有路由都需要认证
router.use(authMiddleware);

// 创建角色
router.post(
  '/',
  validateZod(createCharacterSchema),
  characterController.createCharacter.bind(characterController)
);

// 更新角色
router.put(
  '/:id',
  validateZod(updateCharacterSchema),
  characterController.updateCharacter.bind(characterController)
);

// 删除角色
router.delete(
  '/:id',
  validateZod(deleteCharacterSchema),
  characterController.deleteCharacter.bind(characterController)
);

// 获取单个角色
router.get(
  '/:id',
  validateZod(getCharacterSchema),
  characterController.getCharacter.bind(characterController)
);

// 获取角色列表
router.get(
  '/',
  validateZod(listCharacterSchema),
  characterController.getCharacters.bind(characterController)
);

// 添加角色关系
router.post(
  '/:id/relationships',
  validateZod(addRelationshipSchema),
  characterController.addRelationships.bind(characterController)
);

// 移除角色关系
router.delete(
  '/:id/relationships/:relationshipId',
  validateZod(removeRelationshipSchema),
  characterController.removeRelationship.bind(characterController)
);

// 批量操作
router.post(
  '/bulk',
  characterController.bulkOperation.bind(characterController)
);

// 上传角色图片
router.post(
  '/:id/image',
  characterController.uploadImage.bind(characterController)
);

// 删除角色图片
router.delete(
  '/:id/image',
  characterController.deleteImage.bind(characterController)
);

export { router as characterRouter }; 