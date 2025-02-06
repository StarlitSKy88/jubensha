import { describe, it, expect, beforeEach } from '@jest/globals';
import { EditorService } from '../../src/services/editor';
import { EditorConfig } from '../../src/interfaces/editor';

describe('EditorService', () => {
  let editorService: EditorService;
  const defaultConfig: EditorConfig = {
    maxHistorySize: 50,
    tabSize: 2,
    insertSpaces: true,
    lineNumbers: true,
    wordWrap: true,
    theme: 'default',
    formatOnSave: true
  };

  beforeEach(() => {
    editorService = new EditorService(defaultConfig);
  });

  describe('content management', () => {
    it('should set and get content correctly', () => {
      const content = 'test content';
      editorService.setContent(content);
      expect(editorService.getContent()).toBe(content);
      expect(editorService['state'].isModified).toBe(true);
    });

    it('should add content to history when modified', () => {
      const content = 'test content';
      editorService.setContent(content);
      expect(editorService['state'].history.length).toBe(1);
      expect(editorService['state'].history[0].content).toBe(content);
    });
  });

  describe('cursor management', () => {
    it('should set and get cursor position correctly', () => {
      const line = 1;
      const column = 5;
      editorService.setCursor(line, column);
      const cursor = editorService.getCursor();
      expect(cursor.line).toBe(line);
      expect(cursor.column).toBe(column);
    });
  });

  describe('selection management', () => {
    it('should set and get selection correctly', () => {
      const selection = {
        start: { line: 1, column: 5 },
        end: { line: 2, column: 10 }
      };
      editorService.setSelection(selection.start, selection.end);
      expect(editorService.getSelection()).toEqual(selection);
    });

    it('should return null when no selection is set', () => {
      expect(editorService.getSelection()).toBeNull();
    });
  });

  describe('history management', () => {
    it('should limit history size according to config', () => {
      const maxSize = defaultConfig.maxHistorySize;
      for (let i = 0; i < maxSize + 10; i++) {
        editorService.setContent(`content ${i}`);
      }
      expect(editorService['state'].history.length).toBe(maxSize);
    });

    it('should undo to previous state correctly', () => {
      const content1 = 'content 1';
      const content2 = 'content 2';
      
      editorService.setContent(content1);
      editorService.setContent(content2);
      
      expect(editorService.undo()).toBe(true);
      expect(editorService.getContent()).toBe(content1);
    });
  });

  describe('formatting', () => {
    it('should format content correctly', () => {
      const content = '  line1  \n  line2  \n  line3  ';
      const expected = 'line1\nline2\nline3';
      
      editorService.setContent(content);
      expect(editorService.format()).toBe(expected);
    });
  });

  describe('save management', () => {
    it('should reset modified flag when saved', () => {
      editorService.setContent('test content');
      expect(editorService['state'].isModified).toBe(true);
      
      editorService.save();
      expect(editorService['state'].isModified).toBe(false);
    });
  });
}); 