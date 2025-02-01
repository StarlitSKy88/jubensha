import { 
  type PerformanceMetric, 
  type PerformanceAlert,
  type MetricsSummary,
  PERFORMANCE_CONFIG 
} from '@/utils/performance'
import { performanceStorage } from './performance.service'

// 报告类型
export interface PerformanceReport {
  timestamp: number
  timeRange: {
    start: number
    end: number
  }
  summary: {
    metrics: Record<string, MetricsSummary>
    alerts: {
      total: number
      warning: number
      error: number
    }
    resources: {
      memory: MetricsSummary
      cpu: MetricsSummary
    }
  }
  details: {
    topMetrics: PerformanceMetric[]
    recentAlerts: PerformanceAlert[]
    thresholdViolations: {
      metric: string
      count: number
      maxValue: number
      timestamp: number
    }[]
  }
  recommendations: {
    type: 'critical' | 'warning' | 'info'
    message: string
    metric?: string
    suggestion: string
  }[]
}

export class ReportService {
  // 生成性能报告
  async generateReport(options: {
    startTime: number
    endTime: number
  }): Promise<PerformanceReport> {
    const { startTime, endTime } = options

    // 获取时间范围内的所有数据
    const [metrics, alerts] = await Promise.all([
      performanceStorage.getMetrics({ startTime, endTime }),
      performanceStorage.getAlerts({ startTime, endTime })
    ])

    // 生成报告
    const report: PerformanceReport = {
      timestamp: Date.now(),
      timeRange: { start: startTime, end: endTime },
      summary: this.generateSummary(metrics, alerts),
      details: this.generateDetails(metrics, alerts),
      recommendations: this.generateRecommendations(metrics, alerts)
    }

    return report
  }

  // 生成摘要
  private generateSummary(metrics: PerformanceMetric[], alerts: PerformanceAlert[]) {
    // 按指标类型分组
    const groupedMetrics = this.groupMetrics(metrics)
    
    // 计算每个指标的统计信息
    const metricsSummary: Record<string, MetricsSummary> = {}
    Object.entries(groupedMetrics).forEach(([type, values]) => {
      metricsSummary[type] = this.calculateMetricsSummary(values)
    })

    // 统计告警信息
    const alertsSummary = {
      total: alerts.length,
      warning: alerts.filter(a => a.level === 'warning').length,
      error: alerts.filter(a => a.level === 'error').length
    }

    // 资源使用统计
    const resources = {
      memory: this.calculateMetricsSummary(
        metrics.filter(m => m.type === 'resources.memory').map(m => m.value)
      ),
      cpu: this.calculateMetricsSummary(
        metrics.filter(m => m.type === 'resources.cpu').map(m => m.value)
      )
    }

    return {
      metrics: metricsSummary,
      alerts: alertsSummary,
      resources
    }
  }

  // 生成详细信息
  private generateDetails(metrics: PerformanceMetric[], alerts: PerformanceAlert[]) {
    // 获取性能最差的指标
    const topMetrics = metrics
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)

    // 获取最近的告警
    const recentAlerts = alerts
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10)

    // 统计阈值违反情况
    const violations = new Map<string, { count: number, maxValue: number, timestamp: number }>()
    metrics.forEach(metric => {
      const thresholds = this.getThresholds(metric.type)
      if (thresholds && metric.value > thresholds.error) {
        const current = violations.get(metric.type) || { count: 0, maxValue: 0, timestamp: 0 }
        violations.set(metric.type, {
          count: current.count + 1,
          maxValue: Math.max(current.maxValue, metric.value),
          timestamp: metric.value > current.maxValue ? metric.timestamp : current.timestamp
        })
      }
    })

    const thresholdViolations = Array.from(violations.entries()).map(([metric, data]) => ({
      metric,
      ...data
    }))

    return {
      topMetrics,
      recentAlerts,
      thresholdViolations
    }
  }

  // 生成建议
  private generateRecommendations(metrics: PerformanceMetric[], alerts: PerformanceAlert[]) {
    const recommendations: PerformanceReport['recommendations'] = []

    // 分析性能指标
    Object.entries(this.groupMetrics(metrics)).forEach(([type, values]) => {
      const summary = this.calculateMetricsSummary(values)
      const thresholds = this.getThresholds(type)

      if (thresholds) {
        if (summary.max > thresholds.error) {
          recommendations.push({
            type: 'critical',
            metric: type,
            message: `${type} 严重超过阈值`,
            suggestion: `建议优化 ${type} 相关的代码和配置，当前最大值 ${summary.max}ms 超过错误阈值 ${thresholds.error}ms`
          })
        } else if (summary.p95 > thresholds.warning) {
          recommendations.push({
            type: 'warning',
            metric: type,
            message: `${type} 接近阈值`,
            suggestion: `建议关注 ${type} 的性能趋势，95%的值超过警告阈值 ${thresholds.warning}ms`
          })
        }
      }
    })

    // 分析告警趋势
    const recentAlerts = alerts.filter(a => Date.now() - a.timestamp < 3600000) // 最近1小时
    if (recentAlerts.length > 10) {
      recommendations.push({
        type: 'warning',
        message: '告警频率过高',
        suggestion: '最近1小时内产生了大量告警，建议检查系统状态并优化性能'
      })
    }

    // 分析资源使用
    const memoryMetrics = metrics.filter(m => m.type === 'resources.memory')
    const cpuMetrics = metrics.filter(m => m.type === 'resources.cpu')

    if (memoryMetrics.length > 0) {
      const memoryUsage = this.calculateMetricsSummary(memoryMetrics.map(m => m.value))
      if (memoryUsage.p95 > PERFORMANCE_CONFIG.resources.memory.warning) {
        recommendations.push({
          type: 'warning',
          metric: 'resources.memory',
          message: '内存使用率较高',
          suggestion: '建议检查内存泄漏问题，并考虑优化内存使用'
        })
      }
    }

    if (cpuMetrics.length > 0) {
      const cpuUsage = this.calculateMetricsSummary(cpuMetrics.map(m => m.value))
      if (cpuUsage.p95 > PERFORMANCE_CONFIG.resources.cpu.warning) {
        recommendations.push({
          type: 'warning',
          metric: 'resources.cpu',
          message: 'CPU使用率较高',
          suggestion: '建议优化计算密集型操作，考虑使用Web Worker'
        })
      }
    }

    return recommendations
  }

  // 辅助方法
  private groupMetrics(metrics: PerformanceMetric[]): Record<string, number[]> {
    const groups: Record<string, number[]> = {}
    metrics.forEach(metric => {
      if (!groups[metric.type]) {
        groups[metric.type] = []
      }
      groups[metric.type].push(metric.value)
    })
    return groups
  }

  private calculateMetricsSummary(values: number[]): MetricsSummary {
    if (values.length === 0) {
      return {
        count: 0,
        average: 0,
        max: 0,
        min: 0,
        p95: 0
      }
    }

    const sorted = values.slice().sort((a, b) => a - b)
    const p95Index = Math.floor(sorted.length * 0.95)

    return {
      count: values.length,
      average: values.reduce((a, b) => a + b, 0) / values.length,
      max: Math.max(...values),
      min: Math.min(...values),
      p95: sorted[p95Index]
    }
  }

  private getThresholds(metricType: string) {
    const [category, name] = metricType.split('.')
    return PERFORMANCE_CONFIG[category]?.[name]
  }
}

// 导出单例实例
export const reportService = new ReportService() 