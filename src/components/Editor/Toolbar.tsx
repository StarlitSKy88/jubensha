import React from 'react';
import { ToolbarProps } from '@/types/editor';
import styles from './Editor.module.css';

export const Toolbar: React.FC<ToolbarProps> = ({ editor }) => {
  const handleBold = () => {
    if (!editor) return;
    const selection = editor.getSelection();
    const content = editor.getValue();
    if (selection) {
      const selectedText = content.substring(selection.startLineNumber, selection.endLineNumber);
      editor.executeEdits('', [
        {
          range: selection,
          text: `**${selectedText}**`,
          forceMoveMarkers: true,
        },
      ]);
    }
  };

  const handleItalic = () => {
    if (!editor) return;
    const selection = editor.getSelection();
    const content = editor.getValue();
    if (selection) {
      const selectedText = content.substring(selection.startLineNumber, selection.endLineNumber);
      editor.executeEdits('', [
        {
          range: selection,
          text: `*${selectedText}*`,
          forceMoveMarkers: true,
        },
      ]);
    }
  };

  const handleHeading = (level: number) => {
    if (!editor) return;
    const selection = editor.getSelection();
    const content = editor.getValue();
    if (selection) {
      const selectedText = content.substring(selection.startLineNumber, selection.endLineNumber);
      const prefix = '#'.repeat(level) + ' ';
      editor.executeEdits('', [
        {
          range: selection,
          text: `${prefix}${selectedText}`,
          forceMoveMarkers: true,
        },
      ]);
    }
  };

  return (
    <div className={styles.toolbar}>
      <button onClick={handleBold} title="加粗">B</button>
      <button onClick={handleItalic} title="斜体">I</button>
      <button onClick={() => handleHeading(1)} title="一级标题">H1</button>
      <button onClick={() => handleHeading(2)} title="二级标题">H2</button>
      <button onClick={() => handleHeading(3)} title="三级标题">H3</button>
    </div>
  );
}; 