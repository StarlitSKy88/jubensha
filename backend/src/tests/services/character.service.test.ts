import { CharacterService } from '../../services/character.service'
import { Character, ICharacter } from '../../models/character.model'
import mongoose from 'mongoose'

describe('CharacterService', () => {
  let characterService: CharacterService
  const projectId = 'test-project'

  beforeEach(() => {
    characterService = new CharacterService()
  })

  const createTestCharacter = async (data: Partial<ICharacter> = {}): Promise<ICharacter> => {
    const defaultData = {
      projectId,
      name: '测试角色',
      role: 'protagonist' as const,
      archetype: '英雄',
      personality: {
        traits: ['勇敢', '正直'],
        strengths: ['领导力', '决断力'],
        weaknesses: ['固执', '冲动']
      },
      background: {
        age: 25,
        occupation: '警察',
        history: '从小立志成为一名警察'
      },
      appearance: {
        physical: ['身材高大', '目光坚定'],
        style: ['整洁', '干练'],
        distinctive: ['左脸有疤痕']
      },
      motivation: {
        goals: ['伸张正义', '保护弱小'],
        fears: ['失去亲人', '辜负信任'],
        desires: ['获得认可', '实现理想']
      },
      arc: {
        startingPoint: '初出茅庐的新警察',
        keyEvents: ['第一次执行危险任务', '遭遇生死考验'],
        endingPoint: '成为优秀的警探'
      }
    }

    return characterService.createCharacter({ ...defaultData, ...data })
  }

  describe('CRUD Operations', () => {
    it('should create a character', async () => {
      const character = await createTestCharacter()

      expect(character).toBeDefined()
      expect(character.id).toBeDefined()
      expect(character.name).toBe('测试角色')
      expect(character.role).toBe('protagonist')
    })

    it('should get a character by id', async () => {
      const created = await createTestCharacter()
      const character = await characterService.getCharacter(created.id)

      expect(character).toBeDefined()
      expect(character?.id).toBe(created.id)
      expect(character?.name).toBe(created.name)
    })

    it('should update a character', async () => {
      const created = await createTestCharacter()
      const updateData = {
        name: '更新的角色',
        'personality.traits': ['智慧', '沉稳']
      }

      const updated = await characterService.updateCharacter(created.id, updateData)

      expect(updated).toBeDefined()
      expect(updated?.name).toBe(updateData.name)
      expect(updated?.personality.traits).toEqual(updateData['personality.traits'])
    })

    it('should delete a character', async () => {
      const created = await createTestCharacter()
      const result = await characterService.deleteCharacter(created.id)

      expect(result).toBe(true)

      const character = await characterService.getCharacter(created.id)
      expect(character).toBeNull()
    })

    it('should get characters by project id', async () => {
      await Promise.all([
        createTestCharacter(),
        createTestCharacter({ name: '角色2' }),
        createTestCharacter({ name: '角色3' })
      ])

      const characters = await characterService.getCharacters(projectId)
      expect(characters).toHaveLength(3)
    })
  })

  describe('Character Relationships', () => {
    it('should manage character relationships', async () => {
      const character1 = await createTestCharacter()
      const character2 = await createTestCharacter({ name: '角色2' })

      // 添加关系
      await characterService.addCharacterRelationship({
        sourceId: character1.id,
        targetId: character2.id,
        type: '朋友',
        description: '青梅竹马的好友'
      })

      // 获取关系
      const relationships = await characterService.getCharacterRelationships(character1.id)
      expect(relationships).toHaveLength(1)
      expect(relationships[0].type).toBe('朋友')

      // 更新关系
      await characterService.updateCharacterRelationship(character1.id, character2.id, {
        type: '敌人',
        description: '因误会成为敌人'
      })

      // 删除关系
      await characterService.deleteCharacterRelationship(character1.id, character2.id)
      const afterDelete = await characterService.getCharacterRelationships(character1.id)
      expect(afterDelete).toHaveLength(0)
    })
  })

  describe('Character Analysis', () => {
    it('should analyze a character', async () => {
      const character = await createTestCharacter()
      const analysis = await characterService.analyzeCharacter(character.id)

      expect(analysis).toBeDefined()
      expect(analysis.depth).toBeDefined()
      expect(analysis.consistency).toBeDefined()
      expect(analysis.development).toBeDefined()
    })

    it('should batch analyze characters', async () => {
      await Promise.all([
        createTestCharacter(),
        createTestCharacter({ name: '角色2' })
      ])

      const results = await characterService.batchAnalyzeCharacters(projectId)
      expect(Object.keys(results)).toHaveLength(2)
    })
  })

  describe('Import/Export Operations', () => {
    it('should export and import a character', async () => {
      const original = await createTestCharacter()
      const exported = await characterService.exportCharacter(original.id)

      // 清空数据
      await mongoose.model<ICharacter>('Character').deleteMany({})

      const imported = await characterService.importCharacter(projectId, exported)
      expect(imported.name).toBe(original.name)
      expect(imported.role).toBe(original.role)
    })

    it('should copy a character to another project', async () => {
      const original = await createTestCharacter()
      const copied = await characterService.copyCharacter(original.id, 'another-project')

      expect(copied.name).toBe(original.name)
      expect(copied.projectId).toBe('another-project')
      expect(copied.id).not.toBe(original.id)
    })

    it('should merge two characters', async () => {
      const character1 = await createTestCharacter({
        personality: {
          traits: ['勇敢', '正直'],
          strengths: ['领导力'],
          weaknesses: ['固执']
        }
      })

      const character2 = await createTestCharacter({
        name: '角色2',
        personality: {
          traits: ['智慧', '沉稳'],
          strengths: ['决断力'],
          weaknesses: ['冲动']
        }
      })

      await characterService.mergeCharacters(character2.id, character1.id)

      const merged = await characterService.getCharacter(character1.id)
      expect(merged).toBeDefined()
      expect(merged?.personality.traits).toHaveLength(4)
      expect(merged?.personality.strengths).toHaveLength(2)
      expect(merged?.personality.weaknesses).toHaveLength(2)

      const deleted = await characterService.getCharacter(character2.id)
      expect(deleted).toBeNull()
    })
  })
}) 