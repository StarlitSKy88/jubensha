import { describe, it, expect } from 'vitest'
import { FormatService, type FormatConfig } from '../../src/services/format.service'

describe('FormatService', () => {
  // 创建测试实例
  const createService = (config?: Partial<FormatConfig>) => {
    return new FormatService(config)
  }

  // 测试场景标题格式化
  it('should format scene headings correctly', () => {
    const service = createService({
      indent: { sceneIndent: 4, characterIndent: 0, dialogIndent: 0, actionIndent: 0 },
      case: { sceneCase: 'upper', characterCase: 'normal', transitionCase: 'normal' }
    })

    const input = '内景 咖啡厅 - 日'
    const expected = '    内景 咖啡厅 - 日'
    expect(service.format(input)).toBe(expected.toUpperCase())
  })

  // 测试角色名称格式化
  it('should format character names correctly', () => {
    const service = createService({
      indent: { sceneIndent: 0, characterIndent: 2, dialogIndent: 0, actionIndent: 0 },
      case: { sceneCase: 'normal', characterCase: 'upper', transitionCase: 'normal' }
    })

    const input = '张三\n你好，世界'
    const expected = '  张三\n你好，世界'
    expect(service.format(input)).toBe(expected.toUpperCase() + '\n' + '你好，世界')
  })

  // 测试对话格式化
  it('should format dialog correctly', () => {
    const service = createService({
      indent: { sceneIndent: 0, characterIndent: 0, dialogIndent: 4, actionIndent: 0 },
      width: { dialogWidth: 20, actionWidth: 60 }
    })

    const input = '张三\n这是一段很长的对话，需要自动换行显示。'
    const expected = '张三\n    这是一段很长的对话\n    ，需要自动换行显示\n    。'
    expect(service.format(input)).toBe(expected)
  })

  // 测试动作描述格式化
  it('should format action descriptions correctly', () => {
    const service = createService({
      indent: { sceneIndent: 0, characterIndent: 0, dialogIndent: 0, actionIndent: 2 },
      width: { dialogWidth: 35, actionWidth: 30 }
    })

    const input = '张三走进咖啡厅，环顾四周后找了个靠窗的位置坐下。'
    const expected = '  张三走进咖啡厅，环顾四周后\n  找了个靠窗的位置坐下。'
    expect(service.format(input)).toBe(expected)
  })

  // 测试转场文本格式化
  it('should format transitions correctly', () => {
    const service = createService({
      case: { sceneCase: 'normal', characterCase: 'normal', transitionCase: 'upper' }
    })

    const input = 'cut to:'
    expect(service.format(input)).toBe('CUT TO:')
  })

  // 测试行距
  it('should apply correct line spacing', () => {
    const service = createService({
      spacing: { sceneSpacing: 2, dialogSpacing: 1, actionSpacing: 1 }
    })

    const input = '内景 咖啡厅 - 日\n张三\n你好\n他走进咖啡厅'
    const expected = '内景 咖啡厅 - 日\n\n\n张三\n你好\n\n他走进咖啡厅'
    expect(service.format(input)).toBe(expected)
  })

  // 测试配置更新
  it('should update configuration correctly', () => {
    const service = createService()
    
    service.updateConfig({
      indent: { sceneIndent: 8, characterIndent: 4, dialogIndent: 6, actionIndent: 4 }
    })

    const input = '内景 咖啡厅 - 日'
    const expected = '        内景 咖啡厅 - 日'
    expect(service.format(input)).toBe(expected.toUpperCase())
  })

  // 测试完整剧本格式化
  it('should format complete script correctly', () => {
    const service = createService()
    
    const input = `内景 咖啡厅 - 日
张三
你好，世界。
他微笑着走进咖啡厅。
cut to:
内景 办公室 - 日
李四
早上好。`

    const formatted = service.format(input)
    
    // 验证格式化结果
    expect(formatted).toContain('内景 咖啡厅 - 日'.toUpperCase())
    expect(formatted).toContain('张三'.toUpperCase())
    expect(formatted).toContain('    你好，世界。')
    expect(formatted).toContain('  他微笑着走进咖啡厅。')
    expect(formatted).toContain('CUT TO:')
    expect(formatted).toContain('内景 办公室 - 日'.toUpperCase())
    expect(formatted).toContain('李四'.toUpperCase())
    expect(formatted).toContain('    早上好。')
  })
}) 