import { useState, useCallback } from 'react';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import { PreviewManagerHook, PreviewData } from '@/types/editor';

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: (str: string, lang: string) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value;
      } catch (__) {}
    }
    return ''; // 使用默认的转义
  },
});

export const usePreviewManager = (): PreviewManagerHook => {
  const [preview, setPreview] = useState<string>('');

  const updatePreview = useCallback((content: string) => {
    const html = md.render(content);
    setPreview(html);
  }, []);

  return {
    preview,
    updatePreview,
  };
}; 