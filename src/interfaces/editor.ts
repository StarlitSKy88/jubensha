export interface EditorConfig {
  maxHistorySize: number;
  tabSize: number;
  insertSpaces: boolean;
  lineNumbers: boolean;
  wordWrap: boolean;
  theme: string;
  formatOnSave: boolean;
}

export interface Cursor {
  line: number;
  column: number;
}

export interface Selection {
  start: Cursor;
  end: Cursor;
}

export interface HistoryItem {
  content: string;
  cursor: Cursor;
  timestamp: Date;
}

export interface EditorState {
  content: string;
  cursor: Cursor;
  selection: Selection | null;
  history: HistoryItem[];
  isModified: boolean;
}

export interface EditorCommand {
  name: string;
  shortcut?: string;
  execute: () => void;
}

export interface EditorOptions {
  language?: string;
  readOnly?: boolean;
  minimap?: boolean;
  folding?: boolean;
  autoClosingBrackets?: boolean;
  autoIndent?: boolean;
} 