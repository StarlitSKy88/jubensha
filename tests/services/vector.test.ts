import { describe, it, expect, beforeEach, jest } from 'jest';
import { VectorService } from '../../src/services/vector';
import { VectorData } from '../../src/interfaces/vector';

jest.mock('@zilliz/milvus2-sdk-node');

describe('VectorService', () => {
  let vectorService: VectorService;

  beforeEach(() => {
    vectorService = new VectorService();
  });

  describe('initialize', () => {
    it('should create collection if not exists', async () => {
      const mockHasCollection = jest.spyOn(vectorService['client'], 'hasCollection');
      mockHasCollection.mockResolvedValue(false);

      const mockCreateCollection = jest.spyOn(vectorService['client'], 'createCollection');
      mockCreateCollection.mockResolvedValue(undefined);

      await vectorService.initialize();

      expect(mockHasCollection).toHaveBeenCalled();
      expect(mockCreateCollection).toHaveBeenCalled();
    });
  });

  describe('insert', () => {
    it('should insert vector data successfully', async () => {
      const mockInsert = jest.spyOn(vectorService['client'], 'insert');
      mockInsert.mockResolvedValue({ insert_count: 1 });

      const testData: VectorData = {
        id: '1',
        content: 'test content',
        embedding: [0.1, 0.2, 0.3]
      };

      const result = await vectorService.insert(testData);
      expect(result).toBe('1');
      expect(mockInsert).toHaveBeenCalled();
    });
  });

  describe('search', () => {
    it('should return search results', async () => {
      const mockSearch = jest.spyOn(vectorService['client'], 'search');
      mockSearch.mockResolvedValue({
        results: [
          { id: '1', content: 'result 1' },
          { id: '2', content: 'result 2' }
        ]
      });

      const testEmbedding = [0.1, 0.2, 0.3];
      const results = await vectorService.search(testEmbedding, 2);

      expect(results).toHaveLength(2);
      expect(results[0].id).toBe('1');
      expect(mockSearch).toHaveBeenCalled();
    });
  });
}); 