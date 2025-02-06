import { EditorConfig, EditorState } from '../interfaces/editor';

export class EditorService {
  private config: EditorConfig;
  private state: EditorState;

  constructor(config: EditorConfig) {
    this.config = config;
    this.state = {
      content: '',
      cursor: { line: 0, column: 0 },
      selection: null,
      history: [],
      isModified: false
    };
  }

  setContent(content: string): void {
    this.state.content = content;
    this.state.isModified = true;
    this.addToHistory();
  }

  getContent(): string {
    return this.state.content;
  }

  setCursor(line: number, column: number): void {
    this.state.cursor = { line, column };
  }

  getCursor(): { line: number; column: number } {
    return { ...this.state.cursor };
  }

  setSelection(start: { line: number; column: number }, end: { line: number; column: number }): void {
    this.state.selection = { start, end };
  }

  getSelection(): { start: { line: number; column: number }; end: { line: number; column: number } } | null {
    return this.state.selection ? { ...this.state.selection } : null;
  }

  private addToHistory(): void {
    this.state.history.push({
      content: this.state.content,
      cursor: { ...this.state.cursor },
      timestamp: new Date()
    });

    if (this.state.history.length > this.config.maxHistorySize) {
      this.state.history.shift();
    }
  }

  undo(): boolean {
    if (this.state.history.length > 0) {
      const previousState = this.state.history.pop();
      if (previousState) {
        this.state.content = previousState.content;
        this.state.cursor = previousState.cursor;
        return true;
      }
    }
    return false;
  }

  format(): string {
    // 简单的格式化实现
    const lines = this.state.content.split('\n');
    const formattedLines = lines.map(line => line.trim());
    return formattedLines.join('\n');
  }

  save(): void {
    this.state.isModified = false;
  }
} 