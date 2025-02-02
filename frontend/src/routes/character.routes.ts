import { Router } from 'express'
import { CharacterController } from '../controllers/character.controller'
import { upload } from '../middlewares/upload'

const router = Router()
const characterController = new CharacterController()

// 基础 CRUD 路由
router.get('/', characterController.getCharacters.bind(characterController))
router.get('/:id', characterController.getCharacter.bind(characterController))
router.post('/', characterController.createCharacter.bind(characterController))
router.put('/:id', characterController.updateCharacter.bind(characterController))
router.delete('/:id', characterController.deleteCharacter.bind(characterController))

// 角色分析路由
router.post('/:id/analyze', characterController.analyzeCharacter.bind(characterController))
router.post('/analyze/batch', characterController.batchAnalyzeCharacters.bind(characterController))

// 导入导出路由
router.get('/export', characterController.exportCharacters.bind(characterController))
router.post('/import', upload.single('file'), characterController.importCharacters.bind(characterController))

// 角色关系路由
router.get('/:id/relationships', characterController.getCharacterRelationships.bind(characterController))
router.post('/:id/relationships', characterController.addCharacterRelationship.bind(characterController))
router.put('/:id/relationships/:targetId', characterController.updateCharacterRelationship.bind(characterController))
router.delete('/:id/relationships/:targetId', characterController.deleteCharacterRelationship.bind(characterController))

export default router 