import { Router } from 'express'
import { CharacterController } from '../controllers/character.controller'

const router = Router()
const characterController = new CharacterController()

// 基础 CRUD 路由
router.get('/', characterController.getCharacters.bind(characterController))
router.get('/:id', characterController.getCharacter.bind(characterController))
router.post('/', characterController.createCharacter.bind(characterController))
router.put('/:id', characterController.updateCharacter.bind(characterController))
router.delete('/:id', characterController.deleteCharacter.bind(characterController))

// 角色关系路由
router.get('/:id/relationships', characterController.getCharacterRelationships.bind(characterController))
router.post('/:id/relationships/:targetId', characterController.addCharacterRelationship.bind(characterController))
router.put('/:id/relationships/:targetId', characterController.updateCharacterRelationship.bind(characterController))
router.delete('/:id/relationships/:targetId', characterController.deleteCharacterRelationship.bind(characterController))

// 角色分析路由
router.get('/:id/analysis', characterController.analyzeCharacter.bind(characterController))
router.post('/analysis/batch', characterController.batchAnalyzeCharacters.bind(characterController))

// 导入导出路由
router.get('/:id/export', characterController.exportCharacter.bind(characterController))
router.post('/import', characterController.importCharacter.bind(characterController))

// 复制合并路由
router.post('/:id/copy', characterController.copyCharacter.bind(characterController))
router.post('/:sourceId/merge/:targetId', characterController.mergeCharacters.bind(characterController))

export default router 