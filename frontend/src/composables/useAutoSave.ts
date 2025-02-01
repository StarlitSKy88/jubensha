import { ref, onMounted, onBeforeUnmount } from 'vue'
import { usePerformanceMonitor } from '@/utils/performance'

export interface AutoSaveOptions {
  // 自动保存间隔（毫秒）
  interval?: number
  // 保存前的延迟（毫秒）
  delay?: number
  // 保存函数
  save: () => Promise<void>
  // 是否在组件卸载时保存
  saveOnUnmount?: boolean
  // 是否在窗口关闭时保存
  saveOnWindowClose?: boolean
}

export function useAutoSave(options: AutoSaveOptions) {
  const {
    interval = 30000, // 默认 30 秒
    delay = 1000,    // 默认 1 秒
    save,
    saveOnUnmount = true,
    saveOnWindowClose = true
  } = options

  const { startMeasure, endMeasure } = usePerformanceMonitor()

  // 状态
  const isSaving = ref(false)
  const lastSaveTime = ref(Date.now())
  const hasUnsavedChanges = ref(false)
  const saveError = ref<Error | null>(null)

  // 定时器
  let saveTimer: number | null = null
  let saveDelayTimer: number | null = null

  // 执行保存
  const executeSave = async () => {
    if (isSaving.value || !hasUnsavedChanges.value) return

    try {
      startMeasure('auto-save')
      isSaving.value = true
      saveError.value = null

      await save()
      
      lastSaveTime.value = Date.now()
      hasUnsavedChanges.value = false
    } catch (error) {
      console.error('自动保存失败：', error)
      saveError.value = error as Error
    } finally {
      isSaving.value = false
      endMeasure('auto-save')
    }
  }

  // 触发保存
  const triggerSave = () => {
    hasUnsavedChanges.value = true

    // 清除之前的延迟保存
    if (saveDelayTimer) {
      window.clearTimeout(saveDelayTimer)
    }

    // 设置新的延迟保存
    saveDelayTimer = window.setTimeout(executeSave, delay)
  }

  // 开始自动保存
  const startAutoSave = () => {
    if (saveTimer) return

    saveTimer = window.setInterval(executeSave, interval)
  }

  // 停止自动保存
  const stopAutoSave = () => {
    if (saveTimer) {
      window.clearInterval(saveTimer)
      saveTimer = null
    }

    if (saveDelayTimer) {
      window.clearTimeout(saveDelayTimer)
      saveDelayTimer = null
    }
  }

  // 手动保存
  const manualSave = async () => {
    await executeSave()
  }

  // 窗口关闭事件处理
  const handleWindowClose = async (e: BeforeUnloadEvent) => {
    if (!hasUnsavedChanges.value) return

    // 提示用户有未保存的更改
    e.preventDefault()
    e.returnValue = ''

    try {
      await executeSave()
    } catch (error) {
      console.error('保存失败：', error)
    }
  }

  // 生命周期
  onMounted(() => {
    startAutoSave()

    if (saveOnWindowClose) {
      window.addEventListener('beforeunload', handleWindowClose)
    }
  })

  onBeforeUnmount(() => {
    stopAutoSave()

    if (saveOnWindowClose) {
      window.removeEventListener('beforeunload', handleWindowClose)
    }

    if (saveOnUnmount && hasUnsavedChanges.value) {
      executeSave()
    }
  })

  return {
    isSaving,
    lastSaveTime,
    hasUnsavedChanges,
    saveError,
    triggerSave,
    manualSave,
    startAutoSave,
    stopAutoSave
  }
} 