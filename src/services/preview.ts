import { marked } from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';
import {
  PreviewConfig,
  RenderOptions,
  RenderResult,
  PreviewError,
  PreviewStats
} from '../interfaces/preview';

export class PreviewService {
  private config: PreviewConfig;
  private stats: PreviewStats;
  private renderTimer: NodeJS.Timeout | null = null;

  constructor(config: PreviewConfig) {
    this.config = config;
    this.stats = {
      renderCount: 0,
      averageTime: 0,
      errorCount: 0,
      lastRender: new Date()
    };

    // 配置marked
    marked.setOptions({
      highlight: (code, lang) => {
        if (this.config.highlightCode && lang) {
          try {
            return hljs.highlight(code, { language: lang }).value;
          } catch (error) {
            return code;
          }
        }
        return code;
      }
    });
  }

  async render(content: string, options: RenderOptions = {}): Promise<RenderResult> {
    try {
      // 检查内容大小
      if (content.length > this.config.maxRenderSize) {
        throw this.createError(
          'CONTENT_TOO_LARGE',
          `内容超过最大渲染大小限制 (${this.config.maxRenderSize} 字符)`
        );
      }

      const startTime = Date.now();
      let html = '';
      let toc = '';

      // 根据格式渲染
      if (options.format === 'html') {
        html = content;
      } else {
        // 默认使用markdown渲染
        html = marked(content);
      }

      // 生成目录
      if (options.toc) {
        toc = this.generateTOC(content);
      }

      // HTML净化
      if (this.config.sanitize) {
        html = DOMPurify.sanitize(html);
      }

      // 更新统计信息
      const renderTime = Date.now() - startTime;
      this.updateStats(renderTime);

      return {
        html,
        toc,
        metadata: {
          wordCount: this.countWords(content),
          readingTime: this.calculateReadingTime(content),
          headings: this.extractHeadings(content)
        }
      };
    } catch (error) {
      this.stats.errorCount++;
      throw error;
    }
  }

  async renderDebounced(content: string, options: RenderOptions = {}): Promise<RenderResult> {
    return new Promise((resolve, reject) => {
      if (this.renderTimer) {
        clearTimeout(this.renderTimer);
      }

      this.renderTimer = setTimeout(async () => {
        try {
          const result = await this.render(content, options);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, this.config.renderDelay);
    });
  }

  private generateTOC(content: string): string {
    const headings = this.extractHeadings(content);
    let toc = '<ul class="toc">\n';
    let lastLevel = 0;

    headings.forEach(heading => {
      const match = heading.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2];
        const id = text.toLowerCase().replace(/\s+/g, '-');

        while (level > lastLevel) {
          toc += '<ul>\n';
          lastLevel++;
        }
        while (level < lastLevel) {
          toc += '</ul>\n';
          lastLevel--;
        }

        toc += `<li><a href="#${id}">${text}</a></li>\n`;
      }
    });

    while (lastLevel > 0) {
      toc += '</ul>\n';
      lastLevel--;
    }

    return toc;
  }

  private countWords(content: string): number {
    return content.trim().split(/\s+/).length;
  }

  private calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = this.countWords(content);
    return Math.ceil(wordCount / wordsPerMinute);
  }

  private extractHeadings(content: string): string[] {
    return content
      .split('\n')
      .filter(line => /^#{1,6}\s+.+$/.test(line));
  }

  private updateStats(renderTime: number): void {
    this.stats.renderCount++;
    this.stats.averageTime = (
      (this.stats.averageTime * (this.stats.renderCount - 1) + renderTime) /
      this.stats.renderCount
    );
    this.stats.lastRender = new Date();
  }

  getStats(): PreviewStats {
    return { ...this.stats };
  }

  private createError(code: string, message: string): PreviewError {
    return { code, message };
  }
} 