import { ref, watch } from 'vue'
import type { FormatConfig } from '@/services/format.service'

export function useFormatConfig() {
  // 加载保存的配置
  const loadConfig = (): FormatConfig => {
    try {
      const saved = localStorage.getItem('format_config')
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (error) {
      console.error('加载格式化配置失败:', error)
    }

    // 返回默认配置
    return {
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
  }

  // 配置状态
  const config = ref<FormatConfig>(loadConfig())

  // 监听配置变化并保存
  watch(
    config,
    (newConfig) => {
      try {
        localStorage.setItem('format_config', JSON.stringify(newConfig))
      } catch (error) {
        console.error('保存格式化配置失败:', error)
      }
    },
    { deep: true }
  )

  // 更新配置
  const updateConfig = (type: keyof FormatConfig, value: Partial<FormatConfig[typeof type]>) => {
    config.value = {
      ...config.value,
      [type]: {
        ...config.value[type],
        ...value
      }
    }
  }

  // 重置配置
  const resetConfig = (type: keyof FormatConfig) => {
    const defaultConfig = loadConfig()
    config.value = {
      ...config.value,
      [type]: defaultConfig[type]
    }
  }

  return {
    config,
    updateConfig,
    resetConfig
  }
} 