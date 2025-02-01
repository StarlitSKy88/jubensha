import { ref } from 'vue'
import type { Client } from 'langsmith'

// 监控配置
export interface MonitoringConfig {
  sampleRate: number
  errorSampleRate: number
  userActionSampleRate: number
  metricsEndpoint: string
  alertEndpoint: string
  grafanaEndpoint: string
}

// 默认配置
const DEFAULT_CONFIG: MonitoringConfig = {
  sampleRate: 100,
  errorSampleRate: 100,
  userActionSampleRate: 100,
  metricsEndpoint: '/api/metrics',
  alertEndpoint: '/api/alerts',
  grafanaEndpoint: '/api/grafana'
}

// 性能指标
export interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  labels?: Record<string, string>
}

// 错误信息
export interface ErrorInfo {
  message: string
  stack?: string
  type: string
  timestamp: number
  labels?: Record<string, string>
}

// 用户行为
export interface UserAction {
  action: string
  category: string
  timestamp: number
  details?: Record<string, any>
  labels?: Record<string, string>
}

// 监控服务
export class MonitoringService {
  private config: MonitoringConfig
  private metrics = ref<PerformanceMetric[]>([])
  private errors = ref<ErrorInfo[]>([])
  private actions = ref<UserAction[]>([])
  private langsmith?: Client

  constructor(config: Partial<MonitoringConfig> = {}, langsmith?: Client) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.langsmith = langsmith
  }

  // 记录性能指标
  async recordMetric(metric: Omit<PerformanceMetric, 'timestamp'>): Promise<void> {
    // 采样判断
    if (Math.random() * 100 > this.config.sampleRate) {
      return
    }

    const fullMetric = {
      ...metric,
      timestamp: Date.now()
    }

    // 本地存储
    this.metrics.value.push(fullMetric)

    // 发送到服务器
    try {
      await fetch(this.config.metricsEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(fullMetric)
      })
    } catch (error) {
      console.error('Failed to send metric:', error)
    }

    // LangSmith 集成
    if (this.langsmith) {
      try {
        await this.langsmith.createRun({
          name: 'performance_metric',
          run_type: 'metric',
          inputs: {
            metric: fullMetric.name,
            value: fullMetric.value
          },
          outputs: {},
          extra: {
            ...fullMetric.labels,
            timestamp: new Date(fullMetric.timestamp).toISOString()
          }
        })
      } catch (error) {
        console.error('Failed to send metric to LangSmith:', error)
      }
    }
  }

  // 记录错误
  async recordError(error: Error, type: string, labels?: Record<string, string>): Promise<void> {
    // 采样判断
    if (Math.random() * 100 > this.config.errorSampleRate) {
      return
    }

    const errorInfo: ErrorInfo = {
      message: error.message,
      stack: error.stack,
      type,
      timestamp: Date.now(),
      labels
    }

    // 本地存储
    this.errors.value.push(errorInfo)

    // 发送到服务器
    try {
      await fetch(this.config.alertEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(errorInfo)
      })
    } catch (error) {
      console.error('Failed to send error:', error)
    }

    // LangSmith 集成
    if (this.langsmith) {
      try {
        await this.langsmith.createRun({
          name: 'error_tracking',
          run_type: 'error',
          inputs: {
            message: errorInfo.message,
            stack: errorInfo.stack,
            type: errorInfo.type
          },
          outputs: {},
          extra: {
            ...errorInfo.labels,
            timestamp: new Date(errorInfo.timestamp).toISOString()
          }
        })
      } catch (error) {
        console.error('Failed to send error to LangSmith:', error)
      }
    }
  }

  // 记录用户行为
  async recordAction(action: string, category: string, details?: Record<string, any>, labels?: Record<string, string>): Promise<void> {
    // 采样判断
    if (Math.random() * 100 > this.config.userActionSampleRate) {
      return
    }

    const userAction: UserAction = {
      action,
      category,
      timestamp: Date.now(),
      details,
      labels
    }

    // 本地存储
    this.actions.value.push(userAction)

    // 发送到服务器
    try {
      await fetch(this.config.metricsEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userAction)
      })
    } catch (error) {
      console.error('Failed to send user action:', error)
    }

    // LangSmith 集成
    if (this.langsmith) {
      try {
        await this.langsmith.createRun({
          name: 'user_action',
          run_type: 'action',
          inputs: {
            action: userAction.action,
            category: userAction.category,
            ...userAction.details
          },
          outputs: {},
          extra: {
            ...userAction.labels,
            timestamp: new Date(userAction.timestamp).toISOString()
          }
        })
      } catch (error) {
        console.error('Failed to send user action to LangSmith:', error)
      }
    }
  }

  // 获取性能指标
  getMetrics(filter?: {
    name?: string
    startTime?: number
    endTime?: number
    labels?: Record<string, string>
  }): PerformanceMetric[] {
    let filtered = this.metrics.value

    if (filter?.name) {
      filtered = filtered.filter(m => m.name === filter.name)
    }

    if (filter?.startTime) {
      filtered = filtered.filter(m => m.timestamp >= filter.startTime!)
    }

    if (filter?.endTime) {
      filtered = filtered.filter(m => m.timestamp <= filter.endTime!)
    }

    if (filter?.labels) {
      filtered = filtered.filter(m => {
        if (!m.labels) return false
        return Object.entries(filter.labels!).every(
          ([key, value]) => m.labels![key] === value
        )
      })
    }

    return filtered
  }

  // 获取错误信息
  getErrors(filter?: {
    type?: string
    startTime?: number
    endTime?: number
    labels?: Record<string, string>
  }): ErrorInfo[] {
    let filtered = this.errors.value

    if (filter?.type) {
      filtered = filtered.filter(e => e.type === filter.type)
    }

    if (filter?.startTime) {
      filtered = filtered.filter(e => e.timestamp >= filter.startTime!)
    }

    if (filter?.endTime) {
      filtered = filtered.filter(e => e.timestamp <= filter.endTime!)
    }

    if (filter?.labels) {
      filtered = filtered.filter(e => {
        if (!e.labels) return false
        return Object.entries(filter.labels!).every(
          ([key, value]) => e.labels![key] === value
        )
      })
    }

    return filtered
  }

  // 获取用户行为
  getActions(filter?: {
    action?: string
    category?: string
    startTime?: number
    endTime?: number
    labels?: Record<string, string>
  }): UserAction[] {
    let filtered = this.actions.value

    if (filter?.action) {
      filtered = filtered.filter(a => a.action === filter.action)
    }

    if (filter?.category) {
      filtered = filtered.filter(a => a.category === filter.category)
    }

    if (filter?.startTime) {
      filtered = filtered.filter(a => a.timestamp >= filter.startTime!)
    }

    if (filter?.endTime) {
      filtered = filtered.filter(a => a.timestamp <= filter.endTime!)
    }

    if (filter?.labels) {
      filtered = filtered.filter(a => {
        if (!a.labels) return false
        return Object.entries(filter.labels!).every(
          ([key, value]) => a.labels![key] === value
        )
      })
    }

    return filtered
  }

  // 清除数据
  clearData(options?: {
    metrics?: boolean
    errors?: boolean
    actions?: boolean
  }): void {
    if (!options || options.metrics) {
      this.metrics.value = []
    }
    if (!options || options.errors) {
      this.errors.value = []
    }
    if (!options || options.actions) {
      this.actions.value = []
    }
  }
} 