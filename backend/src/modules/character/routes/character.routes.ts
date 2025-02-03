import { Router } from 'express';
import { characterController } from '../controllers/character.controller';
import { authenticate } from '../../../middleware/auth';
import { validate } from '../../../middleware/validator';
import { apiLimiter } from '../../../middleware/rateLimiter';
import { characterValidation } from '../validations/character.validation';
import { upload } from '../../../middleware/upload';

const router = Router();

// 应用认证和限流中间件
router.use(authenticate);
router.use(apiLimiter);

// 角色管理路由
router.post(
  '/projects/:projectId/characters',
  validate(characterValidation.createCharacter),
  characterController.createCharacter
);

router.get(
  '/projects/:projectId/characters',
  validate(characterValidation.getCharacters),
  characterController.getCharacters
);

router.get(
  '/characters/:characterId',
  validate(characterValidation.getCharacter),
  characterController.getCharacter
);

router.put(
  '/characters/:characterId',
  validate(characterValidation.updateCharacter),
  characterController.updateCharacter
);

router.delete(
  '/characters/:characterId',
  validate(characterValidation.deleteCharacter),
  characterController.deleteCharacter
);

// 角色关系路由
router.post(
  '/characters/:characterId/relationships',
  validate(characterValidation.addRelationships),
  characterController.addRelationships
);

router.delete(
  '/characters/:characterId/relationships/:targetCharacterId',
  validate(characterValidation.removeRelationship),
  characterController.removeRelationship
);

// 批量操作路由
router.post(
  '/projects/:projectId/characters/bulk',
  validate(characterValidation.bulkOperation),
  characterController.bulkOperation
);

// 图片上传路由
router.post(
  '/characters/:characterId/image',
  upload.single('image'),
  characterController.uploadImage
);

router.delete(
  '/characters/:characterId/image',
  characterController.deleteImage
);

export const characterRoutes = router; 