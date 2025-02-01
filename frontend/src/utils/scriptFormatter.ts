// 剧本元素类型
export enum ScriptElementType {
  Scene = 'scene',
  Character = 'character',
  Dialog = 'dialog',
  Action = 'action',
  Transition = 'transition',
  Parenthetical = 'parenthetical'
}

// 剧本元素接口
export interface ScriptElement {
  type: ScriptElementType
  content: string
  character?: string
  parenthetical?: string
}

// 格式化配置
export interface FormatConfig {
  indent: number
  lineSpacing: number
  characterCase: 'upper' | 'title' | 'normal'
  sceneCase: 'upper' | 'title' | 'normal'
  transitionCase: 'upper' | 'title' | 'normal'
  dialogWidth: number
  actionWidth: number
}

// 默认配置
const defaultConfig: FormatConfig = {
  indent: 15,
  lineSpacing: 1,
  characterCase: 'upper',
  sceneCase: 'upper',
  transitionCase: 'upper',
  dialogWidth: 35,
  actionWidth: 60
}

export class ScriptFormatter {
  private config: FormatConfig

  constructor(config: Partial<FormatConfig> = {}) {
    this.config = { ...defaultConfig, ...config }
  }

  // 格式化场景标题
  formatScene(content: string): string {
    const formatted = this.formatCase(content, this.config.sceneCase)
    return `\n${formatted}\n`
  }

  // 格式化角色名
  formatCharacter(name: string, parenthetical?: string): string {
    const formatted = this.formatCase(name, this.config.characterCase)
    if (parenthetical) {
      return `\n${' '.repeat(this.config.indent * 2)}${formatted}\n${' '.repeat(this.config.indent * 2)}(${parenthetical})`
    }
    return `\n${' '.repeat(this.config.indent * 2)}${formatted}`
  }

  // 格式化对话
  formatDialog(content: string): string {
    const lines = this.wrapText(content, this.config.dialogWidth)
    return lines.map(line => `\n${' '.repeat(this.config.indent)}${line}`).join('')
  }

  // 格式化动作
  formatAction(content: string): string {
    const lines = this.wrapText(content, this.config.actionWidth)
    return `\n${lines.join('\n')}\n`
  }

  // 格式化转场
  formatTransition(content: string): string {
    const formatted = this.formatCase(content, this.config.transitionCase)
    return `\n${' '.repeat(this.config.indent * 4)}${formatted}\n`
  }

  // 解析剧本文本
  parse(text: string): ScriptElement[] {
    const elements: ScriptElement[] = []
    const lines = text.split('\n')
    
    let currentElement: Partial<ScriptElement> | null = null
    
    for (const line of lines) {
      const trimmed = line.trim()
      
      // 跳过空行
      if (!trimmed) continue
      
      // 判断元素类型
      if (this.isScene(trimmed)) {
        elements.push({
          type: ScriptElementType.Scene,
          content: trimmed
        })
      } else if (this.isCharacter(trimmed)) {
        currentElement = {
          type: ScriptElementType.Dialog,
          character: trimmed,
          content: ''
        }
      } else if (this.isParenthetical(trimmed)) {
        if (currentElement?.type === ScriptElementType.Dialog) {
          currentElement.parenthetical = trimmed.slice(1, -1)
        }
      } else if (this.isTransition(trimmed)) {
        elements.push({
          type: ScriptElementType.Transition,
          content: trimmed
        })
      } else if (currentElement?.type === ScriptElementType.Dialog) {
        elements.push({
          ...currentElement,
          content: trimmed
        } as ScriptElement)
        currentElement = null
      } else {
        elements.push({
          type: ScriptElementType.Action,
          content: trimmed
        })
      }
    }
    
    return elements
  }

  // 格式化整个剧本
  format(elements: ScriptElement[]): string {
    return elements.map(element => {
      switch (element.type) {
        case ScriptElementType.Scene:
          return this.formatScene(element.content)
        case ScriptElementType.Dialog:
          return this.formatCharacter(element.character!, element.parenthetical) +
                 this.formatDialog(element.content)
        case ScriptElementType.Action:
          return this.formatAction(element.content)
        case ScriptElementType.Transition:
          return this.formatTransition(element.content)
        default:
          return element.content
      }
    }).join('\n')
  }

  // 辅助方法：文本大小写格式化
  private formatCase(text: string, caseType: 'upper' | 'title' | 'normal'): string {
    switch (caseType) {
      case 'upper':
        return text.toUpperCase()
      case 'title':
        return text
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ')
      default:
        return text
    }
  }

  // 辅助方法：文本换行
  private wrapText(text: string, width: number): string[] {
    const words = text.split(' ')
    const lines: string[] = []
    let currentLine = ''
    
    for (const word of words) {
      if (currentLine.length + word.length + 1 <= width) {
        currentLine += (currentLine ? ' ' : '') + word
      } else {
        lines.push(currentLine)
        currentLine = word
      }
    }
    
    if (currentLine) {
      lines.push(currentLine)
    }
    
    return lines
  }

  // 辅助方法：判断是否为场景标题
  private isScene(line: string): boolean {
    return /^(INT\.|EXT\.|INT\/EXT\.)/i.test(line)
  }

  // 辅助方法：判断是否为角色名
  private isCharacter(line: string): boolean {
    return /^[A-Z\s]+$/.test(line)
  }

  // 辅助方法：判断是否为旁白
  private isParenthetical(line: string): boolean {
    return /^\(.*\)$/.test(line)
  }

  // 辅助方法：判断是否为转场
  private isTransition(line: string): boolean {
    return /^(CUT TO:|FADE OUT:|FADE IN:|DISSOLVE TO:)$/i.test(line)
  }
} 