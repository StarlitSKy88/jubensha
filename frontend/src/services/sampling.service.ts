import { PERFORMANCE_CONFIG } from '@/utils/performance'
import type { PerformanceMetric } from '@/utils/performance'

// 采样策略类型
export type SamplingStrategy = 'fixed' | 'adaptive' | 'priority'

// 采样配置
export interface SamplingConfig {
  strategy: SamplingStrategy
  baseInterval: number
  maxInterval: number
  minInterval: number
  batchSize: number
  compressionRatio: number
  retentionDays: number
  priorityThreshold: number
}

// 默认配置
const DEFAULT_CONFIG: SamplingConfig = {
  strategy: 'adaptive',
  baseInterval: PERFORMANCE_CONFIG.sampling.normalInterval,
  maxInterval: 10000, // 10s
  minInterval: 1000,  // 1s
  batchSize: PERFORMANCE_CONFIG.sampling.batchSize,
  compressionRatio: 0.5,
  retentionDays: PERFORMANCE_CONFIG.sampling.retentionDays,
  priorityThreshold: 0.8
}

export class SamplingService {
  private config: SamplingConfig
  private currentInterval: number
  private lastSampleTime: number
  private recentMetrics: PerformanceMetric[] = []
  private compressionBuffer: PerformanceMetric[] = []

  constructor(config: Partial<SamplingConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.currentInterval = this.config.baseInterval
    this.lastSampleTime = Date.now()
  }

  // 判断是否需要采样
  shouldSample(): boolean {
    const now = Date.now()
    const timeSinceLastSample = now - this.lastSampleTime

    switch (this.config.strategy) {
      case 'fixed':
        return timeSinceLastSample >= this.config.baseInterval

      case 'adaptive':
        return timeSinceLastSample >= this.currentInterval

      case 'priority':
        // 如果有高优先级指标，立即采样
        if (this.hasHighPriorityMetrics()) {
          return true
        }
        return timeSinceLastSample >= this.currentInterval

      default:
        return timeSinceLastSample >= this.config.baseInterval
    }
  }

  // 处理采样数据
  processSample(metric: PerformanceMetric): void {
    this.lastSampleTime = Date.now()
    this.recentMetrics.push(metric)

    // 更新采样间隔
    if (this.config.strategy === 'adaptive') {
      this.updateSamplingInterval(metric)
    }

    // 压缩数据
    this.compressData()

    // 清理过期数据
    this.cleanupOldData()
  }

  // 批量处理采样数据
  processBatch(metrics: PerformanceMetric[]): void {
    metrics.forEach(metric => this.processSample(metric))
  }

  // 获取压缩后的数据
  getCompressedData(): PerformanceMetric[] {
    return this.compressionBuffer
  }

  // 更新采样间隔
  private updateSamplingInterval(metric: PerformanceMetric): void {
    const thresholds = this.getThresholds(metric.type)
    if (!thresholds) return

    // 根据当前值与阈值的比例调整采样间隔
    const ratio = metric.value / thresholds.error
    if (ratio > 1) {
      // 值超过错误阈值，减少采样间隔
      this.currentInterval = Math.max(
        this.config.minInterval,
        this.currentInterval * 0.5
      )
    } else if (ratio > 0.8) {
      // 值接近错误阈值，稍微减少采样间隔
      this.currentInterval = Math.max(
        this.config.minInterval,
        this.currentInterval * 0.8
      )
    } else if (ratio < 0.5) {
      // 值远低于阈值，增加采样间隔
      this.currentInterval = Math.min(
        this.config.maxInterval,
        this.currentInterval * 1.2
      )
    }
  }

  // 压缩数据
  private compressData(): void {
    if (this.recentMetrics.length < this.config.batchSize) {
      return
    }

    // 对每个指标类型分别压缩
    const groupedMetrics = this.groupMetricsByType(this.recentMetrics)
    const compressedMetrics: PerformanceMetric[] = []

    Object.entries(groupedMetrics).forEach(([type, metrics]) => {
      // 计算压缩后应保留的数据点数量
      const targetSize = Math.ceil(metrics.length * this.config.compressionRatio)
      
      // 使用 Ramer-Douglas-Peucker 算法压缩数据
      const compressed = this.rdpCompress(metrics, targetSize)
      compressedMetrics.push(...compressed)
    })

    // 更新压缩缓冲区
    this.compressionBuffer = compressedMetrics
    this.recentMetrics = []
  }

  // 清理过期数据
  private cleanupOldData(): void {
    const cutoff = Date.now() - this.config.retentionDays * 24 * 60 * 60 * 1000
    this.compressionBuffer = this.compressionBuffer.filter(
      metric => metric.timestamp >= cutoff
    )
  }

  // 检查是否有高优先级指标
  private hasHighPriorityMetrics(): boolean {
    if (this.recentMetrics.length === 0) return false

    return this.recentMetrics.some(metric => {
      const thresholds = this.getThresholds(metric.type)
      if (!thresholds) return false

      const ratio = metric.value / thresholds.error
      return ratio > this.config.priorityThreshold
    })
  }

  // 按类型分组指标
  private groupMetricsByType(metrics: PerformanceMetric[]): Record<string, PerformanceMetric[]> {
    const groups: Record<string, PerformanceMetric[]> = {}
    
    metrics.forEach(metric => {
      if (!groups[metric.type]) {
        groups[metric.type] = []
      }
      groups[metric.type].push(metric)
    })

    return groups
  }

  // Ramer-Douglas-Peucker 算法实现
  private rdpCompress(points: PerformanceMetric[], targetSize: number): PerformanceMetric[] {
    if (points.length <= targetSize) return points

    // 计算点到线段的距离
    const pointLineDistance = (start: PerformanceMetric, end: PerformanceMetric, point: PerformanceMetric) => {
      const timeRange = end.timestamp - start.timestamp
      const valueRange = end.value - start.value
      
      if (timeRange === 0) return Math.abs(point.value - start.value)
      
      const slope = valueRange / timeRange
      const intercept = start.value - slope * start.timestamp
      
      return Math.abs(slope * point.timestamp - point.value + intercept) / Math.sqrt(slope * slope + 1)
    }

    // 递归压缩
    const compress = (start: number, end: number): number[] => {
      if (end - start <= 1) return []

      let maxDistance = 0
      let maxIndex = start

      for (let i = start + 1; i < end; i++) {
        const distance = pointLineDistance(points[start], points[end], points[i])
        if (distance > maxDistance) {
          maxDistance = distance
          maxIndex = i
        }
      }

      if (maxDistance === 0) return []

      const leftIndices = compress(start, maxIndex)
      const rightIndices = compress(maxIndex, end)

      return [...leftIndices, maxIndex, ...rightIndices]
    }

    // 初始压缩
    const indices = [0, ...compress(0, points.length - 1), points.length - 1]
    let compressed = indices.map(i => points[i])

    // 如果压缩后的点数仍然超过目标大小，进行均匀采样
    if (compressed.length > targetSize) {
      const step = Math.ceil(compressed.length / targetSize)
      compressed = compressed.filter((_, i) => i % step === 0)
    }

    return compressed
  }

  // 获取指标阈值
  private getThresholds(metricType: string) {
    const [category, name] = metricType.split('.')
    return PERFORMANCE_CONFIG[category]?.[name]
  }
}

// 导出单例实例
export const samplingService = new SamplingService() 