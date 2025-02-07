import React, { useEffect, useRef, useState } from 'react';
import * as monaco from 'monaco-editor';
import { debounce } from 'lodash';
import { EditorProps, EditorState } from '@/types/editor';
import { usePreviewManager } from '@/hooks/usePreviewManager';
import { useFileOperations } from '@/hooks/useFileOperations';
import { Toolbar } from './Toolbar';
import { StatusBar } from './StatusBar';
import styles from './Editor.module.css';

export const Editor: React.FC<EditorProps> = ({
  initialContent = '',
  filePath,
  onChange,
  theme = 'vs-dark',
  readOnly = false,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [state, setState] = useState<EditorState>({
    content: initialContent,
    isLoading: false,
    isDirty: false,
    lastSaved: null,
    error: null,
  });

  const { preview, updatePreview } = usePreviewManager();
  const { saveFile, error: saveError, lastSaved } = useFileOperations();

  // 初始化编辑器
  useEffect(() => {
    if (editorRef.current) {
      const editor = monaco.editor.create(editorRef.current, {
        value: initialContent,
        language: 'markdown',
        theme,
        minimap: { enabled: false },
        wordWrap: 'on',
        readOnly,
        automaticLayout: true,
      });

      setEditor(editor);

      return () => {
        editor.dispose();
      };
    }
  }, [initialContent, theme, readOnly]);

  // 处理内容变更和自动保存
  useEffect(() => {
    if (editor && filePath) {
      const handleChange = debounce(async () => {
        const content = editor.getValue();
        setState(prev => ({ ...prev, content, isDirty: true }));
        onChange?.(content);
        updatePreview(content);

        // 自动保存
        try {
          setState(prev => ({ ...prev, isLoading: true }));
          const saved = await saveFile(filePath, content);
          setState(prev => ({
            ...prev,
            isLoading: false,
            isDirty: !saved,
            lastSaved: saved ? new Date() : prev.lastSaved,
            error: null,
          }));
        } catch (error) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: error instanceof Error ? error.message : '保存失败',
          }));
        }
      }, 1000); // 1秒后自动保存

      const disposable = editor.onDidChangeModelContent(handleChange);

      return () => {
        disposable.dispose();
        handleChange.cancel();
      };
    }
  }, [editor, filePath, onChange, updatePreview, saveFile]);

  // 处理手动保存命令
  useEffect(() => {
    if (editor && filePath) {
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, async () => {
        const content = editor.getValue();
        try {
          setState(prev => ({ ...prev, isLoading: true }));
          const saved = await saveFile(filePath, content);
          setState(prev => ({
            ...prev,
            isLoading: false,
            isDirty: !saved,
            lastSaved: saved ? new Date() : prev.lastSaved,
            error: null,
          }));
        } catch (error) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: error instanceof Error ? error.message : '保存失败',
          }));
        }
      });
    }
  }, [editor, filePath, saveFile]);

  return (
    <div className={styles.editorContainer}>
      <Toolbar editor={editor} />
      <div className={styles.mainContent}>
        <div ref={editorRef} className={styles.editor} />
        <div className={styles.preview}>
          <div dangerouslySetInnerHTML={{ __html: preview }} />
        </div>
      </div>
      <StatusBar state={state} />
    </div>
  );
}; 