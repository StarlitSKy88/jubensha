import { editor } from 'monaco-editor';

export interface EditorProps {
  initialContent?: string;
  onChange?: (content: string) => void;
  theme?: string;
  readOnly?: boolean;
}

export interface EditorState {
  content: string;
  isLoading: boolean;
  isDirty: boolean;
}

export interface ToolbarProps {
  editor: editor.IStandaloneCodeEditor | null;
}

export interface StatusBarProps {
  state: EditorState;
} 