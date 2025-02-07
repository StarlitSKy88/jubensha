import React, { useEffect, useRef, useState } from 'react';
import * as monaco from 'monaco-editor';
import { debounce } from 'lodash';
import { EditorProps, EditorState } from '@/types/editor';
import { usePreviewManager } from '@/hooks/usePreviewManager';
import { Toolbar } from './Toolbar';
import { StatusBar } from './StatusBar';
import styles from './Editor.module.css';

export const Editor: React.FC<EditorProps> = ({
  initialContent = '',
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
  });

  const { preview, updatePreview } = usePreviewManager();

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

  // 处理内容变更
  useEffect(() => {
    if (editor) {
      const handleChange = debounce(() => {
        const content = editor.getValue();
        setState(prev => ({ ...prev, content, isDirty: true }));
        onChange?.(content);
        updatePreview(content);
      }, 300);

      const disposable = editor.onDidChangeModelContent(handleChange);

      return () => {
        disposable.dispose();
      };
    }
  }, [editor, onChange, updatePreview]);

  // 处理保存命令
  useEffect(() => {
    if (editor) {
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
        // TODO: 实现保存逻辑
        setState(prev => ({ ...prev, isDirty: false }));
      });
    }
  }, [editor]);

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