import { editor } from 'monaco-editor';

export type Theme = 'vs-light' | 'vs-dark' | 'hc-black';

export interface EditorProps {
  initialContent?: string;
  filePath?: string;
  onChange?: (content: string) => void;
  theme?: Theme;
  readOnly?: boolean;
}

export interface EditorState {
  content: string;
  isLoading: boolean;
  isDirty: boolean;
  lastSaved: Date | null;
  error: string | null;
}

export interface ToolbarProps {
  editor: editor.IStandaloneCodeEditor | null;
}

export interface StatusBarProps {
  state: EditorState;
}

export interface PreviewData {
  html: string;
  wordCount: number;
  lineCount: number;
}

export interface PreviewManagerHook {
  preview: string;
  updatePreview: (content: string) => void;
} 