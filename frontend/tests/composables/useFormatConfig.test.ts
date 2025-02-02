import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useFormatConfig } from '../../src/composables/useFormatConfig'

describe('useFormatConfig', () => {
  // 模拟 localStorage
  const mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    clear: vi.fn()
  }

  // 在每个测试前重置 localStorage
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage
    })
    mockLocalStorage.getItem.mockReset()
    mockLocalStorage.setItem.mockReset()
  })

  // 测试初始化
  it('should initialize with default config when no saved config exists', () => {
    mockLocalStorage.getItem.mockReturnValue(null)
    const { config } = useFormatConfig()

    expect(config.value).toEqual({
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
    })
  })

  // 测试加载保存的配置
  it('should load saved config from localStorage', () => {
    const savedConfig = {
      indent: {
        sceneIndent: 4,
        characterIndent: 4,
        dialogIndent: 6,
        actionIndent: 4
      },
      case: {
        sceneCase: 'title',
        characterCase: 'title',
        transitionCase: 'upper'
      },
      width: {
        dialogWidth: 40,
        actionWidth: 70
      },
      spacing: {
        sceneSpacing: 3,
        dialogSpacing: 2,
        actionSpacing: 2
      }
    }

    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedConfig))
    const { config } = useFormatConfig()

    expect(config.value).toEqual(savedConfig)
  })

  // 测试更新配置
  it('should update config correctly', () => {
    const { config, updateConfig } = useFormatConfig()

    updateConfig('indent', {
      sceneIndent: 4,
      characterIndent: 4
    })

    expect(config.value.indent).toEqual({
      sceneIndent: 4,
      characterIndent: 4,
      dialogIndent: 4,
      actionIndent: 2
    })

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'format_config',
      expect.any(String)
    )
  })

  // 测试重置配置
  it('should reset config correctly', () => {
    const { config, resetConfig } = useFormatConfig()

    // 先修改配置
    config.value.indent = {
      sceneIndent: 4,
      characterIndent: 4,
      dialogIndent: 6,
      actionIndent: 4
    }

    // 重置缩进配置
    resetConfig('indent')

    expect(config.value.indent).toEqual({
      sceneIndent: 0,
      characterIndent: 2,
      dialogIndent: 4,
      actionIndent: 2
    })

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'format_config',
      expect.any(String)
    )
  })

  // 测试配置持久化
  it('should persist config changes to localStorage', () => {
    const { config } = useFormatConfig()

    config.value.indent.sceneIndent = 4

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'format_config',
      expect.any(String)
    )

    const savedConfig = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1])
    expect(savedConfig.indent.sceneIndent).toBe(4)
  })

  // 测试错误处理
  it('should handle localStorage errors gracefully', () => {
    // 模拟 localStorage 错误
    mockLocalStorage.getItem.mockImplementation(() => {
      throw new Error('Storage error')
    })

    const { config } = useFormatConfig()

    // 应该使用默认配置
    expect(config.value.indent.sceneIndent).toBe(0)
    expect(config.value.indent.characterIndent).toBe(2)
  })
}) 