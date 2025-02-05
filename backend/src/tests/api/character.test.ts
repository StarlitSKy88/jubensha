import request from 'supertest'
import { app } from '../../app'
import { Character } from '../../models/character.model'
import type { ICharacter } from '../../models/character.model'
import { nanoid } from 'nanoid'

describe('Character API', () => {
  let testCharacter: ICharacter

  beforeEach(async () => {
    // 创建测试角色
    testCharacter = await Character.create({
      id: nanoid(),
      projectId: 'test-project',
      name: '测试角色',
      role: 'protagonist',
      archetype: '英雄',
      personality: {
        traits: ['勇敢', '正直'],
        strengths: ['领导力', '决断力'],
        weaknesses: ['固执', '急躁']
      },
      background: {
        age: 25,
        occupation: '警察',
        education: '警察学院',
        family: '父母健在，有一个妹妹',
        history: '从小立志成为一名警察...'
      },
      motivation: {
        goals: ['伸张正义', '保护弱小'],
        fears: ['失去亲人', '无能为力'],
        desires: ['升职加薪', '找到真爱']
      },
      arc: {
        startingPoint: '初出茅庐的菜鸟警察',
        keyEvents: [
          '第一次执行危险任务',
          '搭档牺牲',
          '破获大案'
        ],
        endingPoint: '成为优秀的刑警队长'
      },
      relationships: []
    })
  })

  afterEach(async () => {
    // 清理测试数据
    await Character.deleteMany({})
  })

  describe('GET /api/characters', () => {
    it('should return all characters', async () => {
      const res = await request(app)
        .get('/api/characters')
        .query({ projectId: 'test-project' })
        .expect(200)

      expect(Array.isArray(res.body)).toBeTruthy()
      expect(res.body.length).toBe(1)
      expect(res.body[0].name).toBe('测试角色')
    })

    it('should return 400 if projectId is missing', async () => {
      await request(app)
        .get('/api/characters')
        .expect(400)
    })
  })

  describe('GET /api/characters/:id', () => {
    it('should return a character by id', async () => {
      const res = await request(app)
        .get(`/api/characters/${testCharacter.id}`)
        .expect(200)

      expect(res.body.name).toBe('测试角色')
      expect(res.body.role).toBe('protagonist')
    })

    it('should return 404 if character not found', async () => {
      await request(app)
        .get('/api/characters/non-existent-id')
        .expect(404)
    })
  })

  describe('POST /api/characters', () => {
    it('should create a new character', async () => {
      const newCharacter = {
        projectId: 'test-project',
        name: '新角色',
        role: 'antagonist',
        archetype: '反派',
        personality: {
          traits: ['狡猾', '冷酷'],
          strengths: ['智谋', '手段'],
          weaknesses: ['傲慢', '偏执']
        },
        background: {
          age: 35,
          occupation: '商人',
          history: '出身富贵...'
        },
        motivation: {
          goals: ['权力', '财富'],
          fears: ['失败', '背叛'],
          desires: ['控制', '认可']
        },
        arc: {
          startingPoint: '成功商人',
          keyEvents: ['商业阴谋', '权力斗争'],
          endingPoint: '失败逃亡'
        }
      }

      const res = await request(app)
        .post('/api/characters')
        .send(newCharacter)
        .expect(201)

      expect(res.body.name).toBe('新角色')
      expect(res.body.role).toBe('antagonist')
      expect(res.body.id).toBeDefined()
    })

    it('should return 400 if required fields are missing', async () => {
      await request(app)
        .post('/api/characters')
        .send({})
        .expect(400)
    })
  })

  describe('PUT /api/characters/:id', () => {
    it('should update a character', async () => {
      const update = {
        name: '更新后的角色',
        personality: {
          traits: ['沉着', '冷静']
        }
      }

      const res = await request(app)
        .put(`/api/characters/${testCharacter.id}`)
        .send(update)
        .expect(200)

      expect(res.body.name).toBe('更新后的角色')
      expect(res.body.personality.traits).toEqual(['沉着', '冷静'])
    })

    it('should return 404 if character not found', async () => {
      await request(app)
        .put('/api/characters/non-existent-id')
        .send({ name: '更新测试' })
        .expect(404)
    })
  })

  describe('DELETE /api/characters/:id', () => {
    it('should delete a character', async () => {
      await request(app)
        .delete(`/api/characters/${testCharacter.id}`)
        .expect(204)

      const character = await Character.findOne({ id: testCharacter.id })
      expect(character).toBeNull()
    })

    it('should return 404 if character not found', async () => {
      await request(app)
        .delete('/api/characters/non-existent-id')
        .expect(404)
    })
  })

  describe('POST /api/characters/:id/analyze', () => {
    it('should analyze a character', async () => {
      const res = await request(app)
        .post(`/api/characters/${testCharacter.id}/analyze`)
        .expect(200)

      expect(res.body.analysis).toBeDefined()
      expect(res.body.analysis.depth).toBeDefined()
      expect(res.body.analysis.consistency).toBeDefined()
      expect(res.body.analysis.development).toBeDefined()
    })

    it('should return 404 if character not found', async () => {
      await request(app)
        .post('/api/characters/non-existent-id/analyze')
        .expect(404)
    })
  })

  describe('POST /api/characters/analyze/batch', () => {
    it('should analyze multiple characters', async () => {
      const res = await request(app)
        .post('/api/characters/analyze/batch')
        .send({ ids: [testCharacter.id] })
        .expect(200)

      expect(Array.isArray(res.body)).toBeTruthy()
      expect(res.body[0].analysis).toBeDefined()
    })
  })

  describe('GET /api/characters/:id/relationships', () => {
    it('should return character relationships', async () => {
      const res = await request(app)
        .get(`/api/characters/${testCharacter.id}/relationships`)
        .expect(200)

      expect(Array.isArray(res.body)).toBeTruthy()
    })

    it('should return 404 if character not found', async () => {
      await request(app)
        .get('/api/characters/non-existent-id/relationships')
        .expect(404)
    })
  })

  describe('POST /api/characters/:id/relationships', () => {
    it('should add a character relationship', async () => {
      const relationship = {
        targetId: nanoid(),
        type: 'friend',
        description: '青梅竹马的好友'
      }

      const res = await request(app)
        .post(`/api/characters/${testCharacter.id}/relationships`)
        .send(relationship)
        .expect(200)

      expect(res.body.relationships).toHaveLength(1)
      expect(res.body.relationships[0].type).toBe('friend')
    })

    it('should return 404 if character not found', async () => {
      await request(app)
        .post('/api/characters/non-existent-id/relationships')
        .send({
          targetId: nanoid(),
          type: 'friend',
          description: '测试关系'
        })
        .expect(404)
    })
  })

  describe('PUT /api/characters/:id/relationships/:targetId', () => {
    let targetId: string

    beforeEach(async () => {
      targetId = nanoid()
      await Character.findOneAndUpdate(
        { id: testCharacter.id },
        {
          $push: {
            relationships: {
              characterId: targetId,
              type: 'friend',
              description: '初始关系'
            }
          }
        }
      )
    })

    it('should update a character relationship', async () => {
      const update = {
        type: 'enemy',
        description: '关系恶化'
      }

      const res = await request(app)
        .put(`/api/characters/${testCharacter.id}/relationships/${targetId}`)
        .send(update)
        .expect(200)

      const relationship = res.body.relationships.find(
        (r: any) => r.characterId === targetId
      )
      expect(relationship.type).toBe('enemy')
      expect(relationship.description).toBe('关系恶化')
    })

    it('should return 404 if relationship not found', async () => {
      await request(app)
        .put(`/api/characters/${testCharacter.id}/relationships/non-existent-id`)
        .send({
          type: 'enemy',
          description: '测试更新'
        })
        .expect(404)
    })
  })

  describe('DELETE /api/characters/:id/relationships/:targetId', () => {
    let targetId: string

    beforeEach(async () => {
      targetId = nanoid()
      await Character.findOneAndUpdate(
        { id: testCharacter.id },
        {
          $push: {
            relationships: {
              characterId: targetId,
              type: 'friend',
              description: '待删除关系'
            }
          }
        }
      )
    })

    it('should delete a character relationship', async () => {
      const res = await request(app)
        .delete(`/api/characters/${testCharacter.id}/relationships/${targetId}`)
        .expect(200)

      expect(res.body.relationships).toHaveLength(0)
    })

    it('should return 404 if relationship not found', async () => {
      await request(app)
        .delete(`/api/characters/${testCharacter.id}/relationships/non-existent-id`)
        .expect(404)
    })
  })
}) 