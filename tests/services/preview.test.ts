import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { PreviewService } from '../../src/services/preview';
import { PreviewConfig } from '../../src/interfaces/preview';

jest.mock('marked');
jest.mock('dompurify');
jest.mock('highlight.js');

describe('PreviewService', () => {
  let previewService: PreviewService;
  const defaultConfig: PreviewConfig = {
    renderDelay: 300,
    maxRenderSize: 50000,
    theme: 'default',
    sanitize: true,
    highlightCode: true
  };

  beforeEach(() => {
    previewService = new PreviewService(defaultConfig);
  });

  describe('render', () => {
    it('should render markdown content correctly', async () => {
      const content = '# Title\n\nSome content';
      const result = await previewService.render(content);
      
      expect(result.html).toBeDefined();
      expect(result.metadata).toBeDefined();
      expect(result.metadata?.wordCount).toBe(3);
    });

    it('should throw error when content exceeds max size', async () => {
      const content = 'a'.repeat(defaultConfig.maxRenderSize + 1);
      
      await expect(previewService.render(content)).rejects.toEqual({
        code: 'CONTENT_TOO_LARGE',
        message: expect.any(String)
      });
    });

    it('should generate TOC when option is enabled', async () => {
      const content = '# Title 1\n## Section 1.1\n# Title 2';
      const result = await previewService.render(content, { toc: true });
      
      expect(result.toc).toBeDefined();
      expect(result.toc).toContain('Title 1');
      expect(result.toc).toContain('Section 1.1');
      expect(result.toc).toContain('Title 2');
    });

    it('should calculate reading time correctly', async () => {
      const wordsPerMinute = 200;
      const words = Array(400).fill('word').join(' '); // 400 words
      const result = await previewService.render(words);
      
      expect(result.metadata?.readingTime).toBe(2); // 400 words / 200 wpm = 2 minutes
    });
  });

  describe('renderDebounced', () => {
    it('should debounce render calls', async () => {
      const content = '# Test';
      const renderSpy = jest.spyOn(previewService as any, 'render');
      
      // 发起多个渲染请求
      previewService.renderDebounced(content);
      previewService.renderDebounced(content);
      previewService.renderDebounced(content);
      
      // 等待防抖时间
      await new Promise(resolve => setTimeout(resolve, defaultConfig.renderDelay + 50));
      
      expect(renderSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('stats tracking', () => {
    it('should track render statistics correctly', async () => {
      const content = '# Test';
      
      await previewService.render(content);
      const stats = previewService.getStats();
      
      expect(stats.renderCount).toBe(1);
      expect(stats.averageTime).toBeGreaterThan(0);
      expect(stats.lastRender).toBeInstanceOf(Date);
    });

    it('should track error count correctly', async () => {
      const content = 'a'.repeat(defaultConfig.maxRenderSize + 1);
      
      try {
        await previewService.render(content);
      } catch (error) {
        // 预期的错误
      }
      
      const stats = previewService.getStats();
      expect(stats.errorCount).toBe(1);
    });
  });
}); 