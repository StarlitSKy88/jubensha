import { defineStore } from 'pinia'
import { ref } from 'vue'
import { langsmith } from '@/config/langsmith.config'

export interface PerformanceMetrics {
  fileProcessingSpeed: number
  apiResponseTime: number
  memoryUsage: number
  cpuUsage: number
}

export interface ResourceUsage {
  memory: number[]
  cpu: number[]
  network: number[]
}

export interface ErrorStats {
  errors: Array<{
    id: string
    type: string
    message: string
    level: 'error' | 'warning' | 'info'
    time: number
  }>
  categories: Record<string, number>
  trends: Array<{
    time: number
    count: number
  }>
}

export const usePerformanceStore = defineStore('performance', () => {
  // 性能指标
  const metrics = ref<PerformanceMetrics>({
    fileProcessingSpeed: 0,
    apiResponseTime: 0,
    memoryUsage: 0,
    cpuUsage: 0
  })

  // 资源使用
  const resourceUsage = ref<ResourceUsage>({
    memory: Array(30).fill(0),
    cpu: Array(30).fill(0),
    network: Array(30).fill(0)
  })

  // 错误统计
  const errorStats = ref<ErrorStats>({
    errors: [],
    categories: {},
    trends: []
  })

  // 获取性能指标
  const getMetrics = async () => {
    try {
      // 从 LangSmith 获取性能数据
      const runs = await langsmith.client.listRuns({
        projectName: langsmith.config.projectName,
        execution_order: 1,
        limit: 100
      })

      // 计算平均值
      const fileRuns = runs.filter(run => run.run_type === 'file')
      const apiRuns = runs.filter(run => run.run_type === 'metrics')

      metrics.value = {
        fileProcessingSpeed: calculateAverageSpeed(fileRuns),
        apiResponseTime: calculateAverageLatency(apiRuns),
        memoryUsage: getCurrentMemoryUsage(),
        cpuUsage: getCurrentCPUUsage()
      }

      return metrics.value
    } catch (error) {
      console.error('Failed to get metrics:', error)
      return metrics.value
    }
  }

  // 获取资源使用情况
  const getResourceUsage = async () => {
    try {
      // 更新资源使用数据
      resourceUsage.value.memory.shift()
      resourceUsage.value.memory.push(getCurrentMemoryUsage())

      resourceUsage.value.cpu.shift()
      resourceUsage.value.cpu.push(getCurrentCPUUsage())

      resourceUsage.value.network.shift()
      resourceUsage.value.network.push(getCurrentNetworkUsage())

      return resourceUsage.value
    } catch (error) {
      console.error('Failed to get resource usage:', error)
      return resourceUsage.value
    }
  }

  // 获取错误统计
  const getErrorStats = async () => {
    try {
      // 从 LangSmith 获取错误数据
      const runs = await langsmith.client.listRuns({
        projectName: langsmith.config.projectName,
        execution_order: 1,
        limit: 1000
      })

      // 过滤错误运行
      const errorRuns = runs.filter(run => run.error)

      // 更新错误统计
      errorStats.value = {
        errors: errorRuns.map(run => ({
          id: run.id,
          type: getErrorType(run.error),
          message: run.error?.message || '未知错误',
          level: getErrorLevel(run.error),
          time: new Date(run.start_time).getTime()
        })),
        categories: calculateErrorCategories(errorRuns),
        trends: calculateErrorTrends(errorRuns)
      }

      return errorStats.value
    } catch (error) {
      console.error('Failed to get error stats:', error)
      return errorStats.value
    }
  }

  // 辅助函数
  const calculateAverageSpeed = (runs: any[]) => {
    if (runs.length === 0) return 0
    const speeds = runs.map(run => run.outputs?.duration || 0)
    return speeds.reduce((a, b) => a + b, 0) / speeds.length
  }

  const calculateAverageLatency = (runs: any[]) => {
    if (runs.length === 0) return 0
    const latencies = runs.map(run => run.execution_time || 0)
    return latencies.reduce((a, b) => a + b, 0) / latencies.length
  }

  const getCurrentMemoryUsage = () => {
    return Math.random() * 100 // 模拟数据
  }

  const getCurrentCPUUsage = () => {
    return Math.random() * 100 // 模拟数据
  }

  const getCurrentNetworkUsage = () => {
    return Math.random() * 50 // 模拟数据
  }

  const getErrorType = (error: any) => {
    if (!error) return '其他'
    if (error.name === 'NetworkError') return '网络错误'
    if (error.name === 'APIError') return 'API错误'
    if (error.name === 'FileError') return '文件错误'
    if (error.name === 'SystemError') return '系统错误'
    return '其他'
  }

  const getErrorLevel = (error: any) => {
    if (!error) return 'info'
    if (error.severity === 'high') return 'error'
    if (error.severity === 'medium') return 'warning'
    return 'info'
  }

  const calculateErrorCategories = (runs: any[]) => {
    const categories: Record<string, number> = {}
    runs.forEach(run => {
      const type = getErrorType(run.error)
      categories[type] = (categories[type] || 0) + 1
    })
    return categories
  }

  const calculateErrorTrends = (runs: any[]) => {
    const now = Date.now()
    const hourly: Record<number, number> = {}

    runs.forEach(run => {
      const hour = Math.floor(new Date(run.start_time).getTime() / 3600000)
      hourly[hour] = (hourly[hour] || 0) + 1
    })

    return Object.entries(hourly)
      .map(([hour, count]) => ({
        time: parseInt(hour) * 3600000,
        count
      }))
      .sort((a, b) => a.time - b.time)
      .slice(-24) // 最近24小时
  }

  return {
    metrics,
    resourceUsage,
    errorStats,
    getMetrics,
    getResourceUsage,
    getErrorStats
  }
}) 