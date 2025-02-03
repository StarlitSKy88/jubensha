import axios from 'axios';
import { vectorService } from '../vector.service';
import { cacheService } from '../cache.service';

// Mock 依赖
jest.mock('axios');
jest.mock('../cache.service');

describe('VectorService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('textToVector', () => {
    it('应该从缓存返回向量（如果存在）', async () => {
      const mockVector = [0.1, 0.2, 0.3];
      (cacheService.get as jest.Mock).mockResolvedValueOnce(mockVector);

      const result = await vectorService.textToVector('test text', { useCache: true });

      expect(result).toEqual(mockVector);
      expect(cacheService.get).toHaveBeenCalled();
    });

    it('应该调用BERT服务并返回向量', async () => {
      const mockVector = [0.1, 0.2, 0.3];
      (axios.post as jest.Mock).mockResolvedValueOnce({ data: mockVector });

      const result = await vectorService.textToVector('test text');

      expect(result).toEqual(mockVector);
      expect(axios.post).toHaveBeenCalled();
    });

    it('应该处理BERT服务错误', async () => {
      (axios.post as jest.Mock).mockRejectedValueOnce(new Error('BERT service failed'));

      await expect(
        vectorService.textToVector('test text')
      ).rejects.toThrow('BERT service failed');
    });

    it('应该处理无效的响应数据', async () => {
      (axios.post as jest.Mock).mockResolvedValueOnce({ data: 'invalid' });

      await expect(
        vectorService.textToVector('test text')
      ).rejects.toThrow('无效的向量转换响应');
    });
  });

  describe('batchTextToVector', () => {
    it('应该批量处理文本', async () => {
      const texts = ['text1', 'text2', 'text3'];
      const mockVectors = [
        [0.1, 0.2],
        [0.3, 0.4],
        [0.5, 0.6],
      ];

      texts.forEach((_, index) => {
        (axios.post as jest.Mock).mockResolvedValueOnce({ data: mockVectors[index] });
      });

      const result = await vectorService.batchTextToVector(texts, { batchSize: 2 });

      expect(result).toHaveLength(3);
      expect(result).toEqual(mockVectors);
    });

    it('应该处理批处理错误', async () => {
      const texts = ['text1', 'text2'];
      (axios.post as jest.Mock).mockRejectedValueOnce(new Error('Batch processing failed'));

      await expect(
        vectorService.batchTextToVector(texts)
      ).rejects.toThrow('Batch processing failed');
    });
  });

  describe('calculateSimilarity', () => {
    it('应该计算余弦相似度', () => {
      const vector1 = [1, 0];
      const vector2 = [1, 0];
      const vector3 = [0, 1];

      const similarity1 = vectorService.calculateSimilarity(vector1, vector2);
      const similarity2 = vectorService.calculateSimilarity(vector1, vector3);

      expect(similarity1).toBe(1); // 相同向量
      expect(similarity2).toBe(0); // 正交向量
    });

    it('应该处理零向量', () => {
      const vector1 = [0, 0];
      const vector2 = [1, 1];

      const similarity = vectorService.calculateSimilarity(vector1, vector2);

      expect(similarity).toBe(0);
    });

    it('应该处理维度不匹配的向量', () => {
      const vector1 = [1, 0];
      const vector2 = [1, 0, 0];

      expect(() => {
        vectorService.calculateSimilarity(vector1, vector2);
      }).toThrow('向量维度不匹配');
    });
  });

  describe('preprocessText', () => {
    it('应该正确预处理文本', () => {
      const text = '  Hello,   World!  123  ';
      const processedText = (vectorService as any).preprocessText(text);

      expect(processedText).toBe('Hello World 123');
    });

    it('应该截断过长的文本', () => {
      const longText = 'a'.repeat(1000);
      const processedText = (vectorService as any).preprocessText(longText);

      expect(processedText.length).toBeLessThanOrEqual(512);
    });

    it('应该保留中文字符', () => {
      const text = '你好，世界！123 ABC';
      const processedText = (vectorService as any).preprocessText(text);

      expect(processedText).toBe('你好世界123 ABC');
    });
  });
}); 