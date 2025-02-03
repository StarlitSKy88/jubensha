import { searchService } from '../search.service';
import { vectorService } from '../vector.service';
import { cacheService } from '../cache.service';

// Mock 依赖
jest.mock('../vector.service');
jest.mock('../cache.service');

describe('SearchService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('hybridSearch', () => {
    it('应该从缓存返回结果（如果存在）', async () => {
      const mockCachedResult = {
        items: [{ id: '1', title: 'Test' }],
        total: 1,
        page: 1,
        limit: 10,
        took: 100,
      };

      (cacheService.get as jest.Mock).mockResolvedValueOnce(mockCachedResult);

      const result = await searchService.hybridSearch({
        query: 'test',
        useCache: true,
      });

      expect(result).toEqual(mockCachedResult);
      expect(cacheService.get).toHaveBeenCalled();
    });

    it('应该执行文本搜索和向量搜索', async () => {
      const mockTextResults = {
        items: [
          { id: '1', title: 'Test 1', score: 0.8 },
          { id: '2', title: 'Test 2', score: 0.6 },
        ],
        total: 2,
        page: 1,
        limit: 10,
        took: 50,
      };

      const mockVectorResults = {
        items: [
          { id: '2', title: 'Test 2', score: 0.9 },
          { id: '3', title: 'Test 3', score: 0.7 },
        ],
        total: 2,
        page: 1,
        limit: 10,
        took: 30,
      };

      // Mock private methods
      const originalTextSearch = (searchService as any).textSearch;
      const originalVectorSearch = (searchService as any).vectorSearch;

      (searchService as any).textSearch = jest.fn().mockResolvedValueOnce(mockTextResults);
      (searchService as any).vectorSearch = jest.fn().mockResolvedValueOnce(mockVectorResults);

      const result = await searchService.hybridSearch({
        query: 'test',
        vectorSearch: true,
        useCache: false,
      });

      expect(result.items).toHaveLength(3); // 合并后去重
      expect(result.items[0].id).toBe('2'); // 最高分数的结果应该在前面
      
      // 恢复原始方法
      (searchService as any).textSearch = originalTextSearch;
      (searchService as any).vectorSearch = originalVectorSearch;
    });

    it('应该处理搜索错误', async () => {
      (searchService as any).textSearch = jest.fn().mockRejectedValueOnce(new Error('Search failed'));

      await expect(
        searchService.hybridSearch({
          query: 'test',
          useCache: false,
        })
      ).rejects.toThrow('Search failed');
    });
  });

  describe('textToVector', () => {
    it('应该调用向量服务并返回向量', async () => {
      const mockVector = [0.1, 0.2, 0.3];
      (vectorService.textToVector as jest.Mock).mockResolvedValueOnce(mockVector);

      const result = await (searchService as any).textToVector('test text');

      expect(result).toEqual(mockVector);
      expect(vectorService.textToVector).toHaveBeenCalledWith('test text', { useCache: true });
    });

    it('应该处理向量转换错误', async () => {
      (vectorService.textToVector as jest.Mock).mockRejectedValueOnce(new Error('Vectorization failed'));

      await expect(
        (searchService as any).textToVector('test text')
      ).rejects.toThrow('Vectorization failed');
    });
  });

  describe('mergeResults', () => {
    it('应该正确合并和排序搜索结果', () => {
      const textResults = [
        { id: '1', title: 'Test 1', score: 0.8 },
        { id: '2', title: 'Test 2', score: 0.6 },
      ];

      const vectorResults = [
        { id: '2', title: 'Test 2', score: 0.9 },
        { id: '3', title: 'Test 3', score: 0.7 },
      ];

      const result = (searchService as any).mergeResults(textResults, vectorResults);

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('2'); // 最高组合分数
      expect(result[1].id).toBe('1');
      expect(result[2].id).toBe('3');
    });

    it('应该处理没有分数的结果', () => {
      const textResults = [
        { id: '1', title: 'Test 1' },
        { id: '2', title: 'Test 2' },
      ];

      const vectorResults = [
        { id: '3', title: 'Test 3' },
      ];

      const result = (searchService as any).mergeResults(textResults, vectorResults);

      expect(result).toHaveLength(3);
      expect(result.every(item => item.id && item.title)).toBe(true);
    });
  });
}); 