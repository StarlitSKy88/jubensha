import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { FileService } from '@/services/core/file.service'
import { MonitoringService } from '@/services/core/monitoring.service'
import type { FileStatus } from '@/services/core/file.service'
import type { PerformanceMetric, ErrorInfo, UserAction } from '@/services/core/monitoring.service'

// 应用状态
export const useAppStore = defineStore('app', () => {
  // 服务实例
  const fileService = new FileService()
  const monitoringService = new MonitoringService()

  // 状态
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const initialized = ref(false)

  // 文件状态
  const fileStatus = computed(() => {
    const status = new Map<string, FileStatus>()
    for (const [id, state] of fileService.getAllStatus()) {
      status.set(id, state)
    }
    return status
  })

  // 性能指标
  const metrics = computed(() => 
    monitoringService.getMetrics({
      startTime: Date.now() - 24 * 60 * 60 * 1000 // 最近24小时
    })
  )

  // 错误信息
  const errors = computed(() => 
    monitoringService.getErrors({
      startTime: Date.now() - 24 * 60 * 60 * 1000 // 最近24小时
    })
  )

  // 用户行为
  const actions = computed(() => 
    monitoringService.getActions({
      startTime: Date.now() - 24 * 60 * 60 * 1000 // 最近24小时
    })
  )

  // 加载文件
  async function loadFile(file: File): Promise<ArrayBuffer> {
    loading.value = true
    error.value = null

    try {
      const result = await fileService.loadFile(file)
      return result
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  // 取消文件加载
  function cancelFileLoad(fileId?: string): void {
    fileService.cancel(fileId)
  }

  // 清除文件状态
  function clearFileStatus(fileId?: string): void {
    fileService.clearStatus(fileId)
  }

  // 记录性能指标
  async function recordMetric(metric: Omit<PerformanceMetric, 'timestamp'>): Promise<void> {
    try {
      await monitoringService.recordMetric(metric)
    } catch (e) {
      console.error('Failed to record metric:', e)
    }
  }

  // 记录错误
  async function recordError(error: Error, type: string, labels?: Record<string, string>): Promise<void> {
    try {
      await monitoringService.recordError(error, type, labels)
    } catch (e) {
      console.error('Failed to record error:', e)
    }
  }

  // 记录用户行为
  async function recordAction(
    action: string,
    category: string,
    details?: Record<string, any>,
    labels?: Record<string, string>
  ): Promise<void> {
    try {
      await monitoringService.recordAction(action, category, details, labels)
    } catch (e) {
      console.error('Failed to record action:', e)
    }
  }

  // 清除监控数据
  function clearMonitoringData(options?: {
    metrics?: boolean
    errors?: boolean
    actions?: boolean
  }): void {
    monitoringService.clearData(options)
  }

  // 初始化
  async function initialize(): Promise<void> {
    if (initialized.value) return

    loading.value = true
    error.value = null

    try {
      // TODO: 添加初始化逻辑
      initialized.value = true
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    // 状态
    loading,
    error,
    initialized,
    fileStatus,
    metrics,
    errors,
    actions,

    // 方法
    initialize,
    loadFile,
    cancelFileLoad,
    clearFileStatus,
    recordMetric,
    recordError,
    recordAction,
    clearMonitoringData
  }
}) 