// 格式化配置类型
export interface FormatConfig {
  // 缩进配置
  indent: {
    sceneIndent: number
    characterIndent: number
    dialogIndent: number
    actionIndent: number
  }
  // 大小写配置
  case: {
    sceneCase: 'upper' | 'title' | 'normal'
    characterCase: 'upper' | 'title' | 'normal'
    transitionCase: 'upper' | 'title' | 'normal'
  }
  // 宽度配置
  width: {
    dialogWidth: number
    actionWidth: number
  }
  // 行距配置
  spacing: {
    sceneSpacing: number
    dialogSpacing: number
    actionSpacing: number
  }
}

// 默认配置
export const defaultFormatConfig: FormatConfig = {
  indent: {
    sceneIndent: 0,
    characterIndent: 2,
    dialogIndent: 4,
    actionIndent: 2
  },
  case: {
    sceneCase: 'upper',
    characterCase: 'upper',
    transitionCase: 'upper'
  },
  width: {
    dialogWidth: 35,
    actionWidth: 60
  },
  spacing: {
    sceneSpacing: 2,
    dialogSpacing: 1,
    actionSpacing: 1
  }
}

// 行类型
type LineType = 'scene' | 'character' | 'dialog' | 'action' | 'transition' | 'empty'

export class FormatService {
  private config: FormatConfig

  constructor(config: Partial<FormatConfig> = {}) {
    this.config = {
      ...defaultFormatConfig,
      ...config
    }
  }

  // 格式化文本
  format(text: string): string {
    // 分割为行
    const lines = text.split('\n')
    const formattedLines: string[] = []
    let lastLineType: LineType = 'empty'

    // 处理每一行
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      const lineType = this.getLineType(line, lastLineType)

      // 添加行距
      if (lineType !== 'empty' && lastLineType !== 'empty') {
        const spacing = this.getSpacing(lineType, lastLineType)
        for (let j = 0; j < spacing; j++) {
          formattedLines.push('')
        }
      }

      // 格式化行内容
      if (line) {
        const formattedLine = this.formatLine(line, lineType)
        formattedLines.push(formattedLine)
      } else {
        formattedLines.push('')
      }

      lastLineType = lineType
    }

    return formattedLines.join('\n')
  }

  // 更新配置
  updateConfig(config: Partial<FormatConfig>) {
    this.config = {
      ...this.config,
      ...config
    }
  }

  // 获取行类型
  private getLineType(line: string, lastLineType: LineType): LineType {
    if (!line) return 'empty'

    // 场景标题
    if (/^(内景|外景|转场)\s+/.test(line)) {
      return 'scene'
    }

    // 转场
    if (/^(CUT TO:|FADE IN:|FADE OUT:|DISSOLVE TO:)$/i.test(line)) {
      return 'transition'
    }

    // 角色名称
    if (lastLineType === 'empty' && /^[A-Z\u4e00-\u9fa5]+$/.test(line)) {
      return 'character'
    }

    // 对话
    if (lastLineType === 'character') {
      return 'dialog'
    }

    // 动作
    return 'action'
  }

  // 格式化单行
  private formatLine(line: string, type: LineType): string {
    // 应用缩进
    const indent = this.getIndent(type)
    let formatted = ' '.repeat(indent) + line

    // 应用大小写
    formatted = this.applyCase(formatted, type)

    // 应用宽度限制
    formatted = this.applyWidth(formatted, type)

    return formatted
  }

  // 获取缩进
  private getIndent(type: LineType): number {
    switch (type) {
      case 'scene':
        return this.config.indent.sceneIndent
      case 'character':
        return this.config.indent.characterIndent
      case 'dialog':
        return this.config.indent.dialogIndent
      case 'action':
        return this.config.indent.actionIndent
      default:
        return 0
    }
  }

  // 应用大小写
  private applyCase(text: string, type: LineType): string {
    let caseType = 'normal'

    switch (type) {
      case 'scene':
        caseType = this.config.case.sceneCase
        break
      case 'character':
        caseType = this.config.case.characterCase
        break
      case 'transition':
        caseType = this.config.case.transitionCase
        break
    }

    switch (caseType) {
      case 'upper':
        return text.toUpperCase()
      case 'title':
        return text.replace(/\b\w/g, c => c.toUpperCase())
      default:
        return text
    }
  }

  // 应用宽度限制
  private applyWidth(text: string, type: LineType): string {
    let width = 0

    switch (type) {
      case 'dialog':
        width = this.config.width.dialogWidth
        break
      case 'action':
        width = this.config.width.actionWidth
        break
      default:
        return text
    }

    if (text.length <= width) return text

    const words = text.split(/\s+/)
    const lines: string[] = []
    let currentLine = words[0]

    for (let i = 1; i < words.length; i++) {
      const word = words[i]
      const testLine = currentLine + ' ' + word

      if (testLine.length <= width) {
        currentLine = testLine
      } else {
        lines.push(currentLine)
        currentLine = ' '.repeat(this.getIndent(type)) + word
      }
    }

    lines.push(currentLine)
    return lines.join('\n')
  }

  // 获取行距
  private getSpacing(currentType: LineType, lastType: LineType): number {
    if (currentType === 'scene') {
      return this.config.spacing.sceneSpacing
    }

    if (currentType === 'dialog' && lastType === 'character') {
      return 0
    }

    if (currentType === 'dialog' || lastType === 'dialog') {
      return this.config.spacing.dialogSpacing
    }

    if (currentType === 'action' || lastType === 'action') {
      return this.config.spacing.actionSpacing
    }

    return 1
  }
} 