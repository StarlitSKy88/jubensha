export interface PreviewConfig {
  renderDelay: number;      // 渲染延迟(ms)
  maxRenderSize: number;    // 最大渲染大小(字符)
  theme: string;           // 预览主题
  sanitize: boolean;       // 是否净化HTML
  highlightCode: boolean;  // 是否高亮代码
}

export interface RenderOptions {
  format?: string;         // 渲染格式(markdown/html)
  theme?: string;          // 主题覆盖
  highlight?: boolean;     // 是否高亮
  lineNumbers?: boolean;   // 是否显示行号
  toc?: boolean;          // 是否生成目录
}

export interface RenderResult {
  html: string;           // 渲染后的HTML
  toc?: string;          // 目录HTML
  metadata?: {           // 元数据
    wordCount: number;   // 字数统计
    readingTime: number; // 预计阅读时间(分钟)
    headings: string[];  // 标题列表
  };
}

export interface PreviewError {
  code: string;          // 错误代码
  message: string;       // 错误信息
  position?: {          // 错误位置
    line: number;
    column: number;
  };
}

export interface PreviewStats {
  renderCount: number;   // 渲染次数
  averageTime: number;   // 平均渲染时间(ms)
  errorCount: number;    // 错误次数
  lastRender: Date;      // 最后渲染时间
} 