import { Request, Response } from 'express'
import { CharacterController } from '../../controllers/character.controller'
import { CharacterService } from '../../services/character.service'
import { ICharacter } from '../../models/character.model'

jest.mock('../../services/character.service')

describe('CharacterController', () => {
  let characterController: CharacterController
  let mockCharacterService: jest.Mocked<CharacterService>
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockJson: jest.Mock
  let mockStatus: jest.Mock
  let mockSend: jest.Mock

  beforeEach(() => {
    mockJson = jest.fn()
    mockStatus = jest.fn().mockReturnThis()
    mockSend = jest.fn()

    mockResponse = {
      json: mockJson,
      status: mockStatus,
      send: mockSend
    }

    mockCharacterService = new CharacterService() as jest.Mocked<CharacterService>
    characterController = new CharacterController()
    ;(characterController as any).characterService = mockCharacterService
  })

  describe('CRUD Operations', () => {
    const mockCharacter: Partial<ICharacter> = {
      id: 'test-id',
      projectId: 'test-project',
      name: '测试角色',
      role: 'protagonist',
      archetype: '英雄'
    }

    it('should get characters', async () => {
      mockRequest = {
        query: { projectId: 'test-project' }
      }

      mockCharacterService.getCharacters.mockResolvedValue([mockCharacter as ICharacter])

      await characterController.getCharacters(mockRequest as Request, mockResponse as Response)

      expect(mockCharacterService.getCharacters).toHaveBeenCalledWith('test-project')
      expect(mockJson).toHaveBeenCalledWith([mockCharacter])
    })

    it('should return 400 if projectId is missing', async () => {
      mockRequest = {
        query: {}
      }

      await characterController.getCharacters(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(400)
      expect(mockJson).toHaveBeenCalledWith({ message: '缺少项目ID' })
    })

    it('should get a character by id', async () => {
      mockRequest = {
        params: { id: 'test-id' }
      }

      mockCharacterService.getCharacter.mockResolvedValue(mockCharacter as ICharacter)

      await characterController.getCharacter(mockRequest as Request, mockResponse as Response)

      expect(mockCharacterService.getCharacter).toHaveBeenCalledWith('test-id')
      expect(mockJson).toHaveBeenCalledWith(mockCharacter)
    })

    it('should return 404 if character not found', async () => {
      mockRequest = {
        params: { id: 'test-id' }
      }

      mockCharacterService.getCharacter.mockResolvedValue(null)

      await characterController.getCharacter(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(404)
      expect(mockJson).toHaveBeenCalledWith({ message: '角色不存在' })
    })

    it('should create a character', async () => {
      mockRequest = {
        body: mockCharacter
      }

      mockCharacterService.createCharacter.mockResolvedValue(mockCharacter as ICharacter)

      await characterController.createCharacter(mockRequest as Request, mockResponse as Response)

      expect(mockCharacterService.createCharacter).toHaveBeenCalledWith(mockCharacter)
      expect(mockStatus).toHaveBeenCalledWith(201)
      expect(mockJson).toHaveBeenCalledWith(mockCharacter)
    })

    it('should update a character', async () => {
      const updateData = { name: '更新的角色' }
      mockRequest = {
        params: { id: 'test-id' },
        body: updateData
      }

      mockCharacterService.updateCharacter.mockResolvedValue({ ...mockCharacter, ...updateData } as ICharacter)

      await characterController.updateCharacter(mockRequest as Request, mockResponse as Response)

      expect(mockCharacterService.updateCharacter).toHaveBeenCalledWith('test-id', updateData)
      expect(mockJson).toHaveBeenCalledWith({ ...mockCharacter, ...updateData })
    })

    it('should delete a character', async () => {
      mockRequest = {
        params: { id: 'test-id' }
      }

      mockCharacterService.deleteCharacter.mockResolvedValue(true)

      await characterController.deleteCharacter(mockRequest as Request, mockResponse as Response)

      expect(mockCharacterService.deleteCharacter).toHaveBeenCalledWith('test-id')
      expect(mockStatus).toHaveBeenCalledWith(204)
      expect(mockSend).toHaveBeenCalled()
    })
  })

  describe('Character Relationships', () => {
    const mockRelationship = {
      id: 'rel-id',
      sourceId: 'source-id',
      targetId: 'target-id',
      type: '朋友',
      description: '青梅竹马'
    }

    it('should get character relationships', async () => {
      mockRequest = {
        params: { id: 'test-id' }
      }

      mockCharacterService.getCharacterRelationships.mockResolvedValue([mockRelationship])

      await characterController.getCharacterRelationships(mockRequest as Request, mockResponse as Response)

      expect(mockCharacterService.getCharacterRelationships).toHaveBeenCalledWith('test-id')
      expect(mockJson).toHaveBeenCalledWith([mockRelationship])
    })

    it('should add character relationship', async () => {
      mockRequest = {
        params: { id: 'source-id', targetId: 'target-id' },
        body: {
          type: '朋友',
          description: '青梅竹马'
        }
      }

      await characterController.addCharacterRelationship(mockRequest as Request, mockResponse as Response)

      expect(mockCharacterService.addCharacterRelationship).toHaveBeenCalledWith({
        sourceId: 'source-id',
        targetId: 'target-id',
        type: '朋友',
        description: '青梅竹马'
      })
      expect(mockStatus).toHaveBeenCalledWith(204)
      expect(mockSend).toHaveBeenCalled()
    })
  })

  describe('Character Analysis', () => {
    const mockAnalysis = {
      depth: { score: 75, suggestions: ['建议1'] },
      consistency: { score: 80, issues: ['问题1'] },
      development: {
        score: 85,
        analysis: '分析结果',
        suggestions: ['建议2']
      }
    }

    it('should analyze a character', async () => {
      mockRequest = {
        params: { id: 'test-id' }
      }

      mockCharacterService.analyzeCharacter.mockResolvedValue(mockAnalysis)

      await characterController.analyzeCharacter(mockRequest as Request, mockResponse as Response)

      expect(mockCharacterService.analyzeCharacter).toHaveBeenCalledWith('test-id')
      expect(mockJson).toHaveBeenCalledWith(mockAnalysis)
    })

    it('should batch analyze characters', async () => {
      mockRequest = {
        query: { projectId: 'test-project' }
      }

      const mockResults = {
        'char-1': mockAnalysis,
        'char-2': mockAnalysis
      }

      mockCharacterService.batchAnalyzeCharacters.mockResolvedValue(mockResults)

      await characterController.batchAnalyzeCharacters(mockRequest as Request, mockResponse as Response)

      expect(mockCharacterService.batchAnalyzeCharacters).toHaveBeenCalledWith('test-project')
      expect(mockJson).toHaveBeenCalledWith(mockResults)
    })
  })

  describe('Import/Export Operations', () => {
    const mockCharacter: Partial<ICharacter> = {
      id: 'test-id',
      projectId: 'test-project',
      name: '测试角色',
      role: 'protagonist'
    }

    it('should export a character', async () => {
      mockRequest = {
        params: { id: 'test-id' }
      }

      mockCharacterService.exportCharacter.mockResolvedValue(mockCharacter as ICharacter)

      await characterController.exportCharacter(mockRequest as Request, mockResponse as Response)

      expect(mockCharacterService.exportCharacter).toHaveBeenCalledWith('test-id')
      expect(mockJson).toHaveBeenCalledWith(mockCharacter)
    })

    it('should import a character', async () => {
      mockRequest = {
        query: { projectId: 'test-project' },
        body: mockCharacter
      }

      mockCharacterService.importCharacter.mockResolvedValue(mockCharacter as ICharacter)

      await characterController.importCharacter(mockRequest as Request, mockResponse as Response)

      expect(mockCharacterService.importCharacter).toHaveBeenCalledWith('test-project', mockCharacter)
      expect(mockStatus).toHaveBeenCalledWith(201)
      expect(mockJson).toHaveBeenCalledWith(mockCharacter)
    })

    it('should copy a character', async () => {
      mockRequest = {
        params: { id: 'test-id' },
        body: { projectId: 'target-project' }
      }

      const copiedCharacter = { ...mockCharacter, id: 'new-id', projectId: 'target-project' }
      mockCharacterService.copyCharacter.mockResolvedValue(copiedCharacter as ICharacter)

      await characterController.copyCharacter(mockRequest as Request, mockResponse as Response)

      expect(mockCharacterService.copyCharacter).toHaveBeenCalledWith('test-id', 'target-project')
      expect(mockStatus).toHaveBeenCalledWith(201)
      expect(mockJson).toHaveBeenCalledWith(copiedCharacter)
    })

    it('should merge characters', async () => {
      mockRequest = {
        params: { sourceId: 'source-id', targetId: 'target-id' }
      }

      await characterController.mergeCharacters(mockRequest as Request, mockResponse as Response)

      expect(mockCharacterService.mergeCharacters).toHaveBeenCalledWith('source-id', 'target-id')
      expect(mockStatus).toHaveBeenCalledWith(204)
      expect(mockSend).toHaveBeenCalled()
    })
  })
}) 