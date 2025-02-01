import { Client } from 'langsmith'

// LangSmith 配置
export interface LangSmithConfig {
  apiKey: string
  projectName: string
  environment?: string
  tracing?: boolean
}

// 默认配置
const DEFAULT_CONFIG: LangSmithConfig = {
  apiKey: import.meta.env.LANGSMITH_API_KEY || '',
  projectName: import.meta.env.LANGSMITH_PROJECT || 'file-loader-monitoring',
  environment: import.meta.env.NODE_ENV,
  tracing: import.meta.env.LANGSMITH_TRACING === 'true'
}

// LangSmith 客户端
export class LangSmithClient {
  public client: Client
  public config: LangSmithConfig

  constructor(config: Partial<LangSmithConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    // @ts-ignore - endpoint 参数在最新版本中支持
    this.client = new Client({
      apiKey: this.config.apiKey,
      endpoint: import.meta.env.LANGSMITH_ENDPOINT
    })
  }

  // 记录性能指标
  async logMetrics(metrics: Map<string, number>): Promise<void> {
    if (!this.config.tracing) return

    const data = Object.fromEntries(metrics)
    await this.client.createRun({
      name: 'performance_metrics',
      run_type: 'metrics',
      inputs: data,
      outputs: {},
      extra: {
        project: this.config.projectName,
        environment: this.config.environment,
        category: 'performance',
        timestamp: new Date().toISOString()
      }
    })
  }

  // 记录错误
  async logError(error: Error): Promise<void> {
    if (!this.config.tracing) return

    await this.client.createRun({
      name: 'error_tracking',
      run_type: 'error',
      inputs: {
        message: error.message,
        stack: error.stack,
        type: error.name
      },
      outputs: {},
      extra: {
        project: this.config.projectName,
        environment: this.config.environment,
        category: 'error',
        timestamp: new Date().toISOString()
      }
    })
  }

  // 记录文件操作
  async logFileOperation(operation: string, file: File, duration: number): Promise<void> {
    if (!this.config.tracing) return

    await this.client.createRun({
      name: 'file_operation',
      run_type: 'file',
      inputs: {
        operation,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        lastModified: new Date(file.lastModified).toISOString()
      },
      outputs: {
        duration,
        success: true
      },
      extra: {
        project: this.config.projectName,
        environment: this.config.environment,
        category: 'file',
        operation,
        timestamp: new Date().toISOString()
      }
    })
  }

  // 记录用户行为
  async logUserAction(action: string, details: Record<string, any>): Promise<void> {
    if (!this.config.tracing) return

    await this.client.createRun({
      name: 'user_action',
      run_type: 'user',
      inputs: {
        action,
        ...details,
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language
      },
      outputs: {},
      extra: {
        project: this.config.projectName,
        environment: this.config.environment,
        category: 'user',
        action,
        timestamp: new Date().toISOString()
      }
    })
  }

  // 记录系统性能
  async logSystemPerformance(): Promise<void> {
    if (!this.config.tracing) return

    const performance = window.performance
    const memory = (performance as any).memory

    await this.client.createRun({
      name: 'system_performance',
      run_type: 'system',
      inputs: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        memory: memory ? {
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
          totalJSHeapSize: memory.totalJSHeapSize,
          usedJSHeapSize: memory.usedJSHeapSize
        } : undefined,
        timing: {
          navigationStart: performance.timing.navigationStart,
          loadEventEnd: performance.timing.loadEventEnd,
          domComplete: performance.timing.domComplete,
          domInteractive: performance.timing.domInteractive
        }
      },
      outputs: {},
      extra: {
        project: this.config.projectName,
        environment: this.config.environment,
        category: 'system',
        timestamp: new Date().toISOString()
      }
    })
  }

  // 获取运行记录
  async listRuns(params: {
    executionOrder?: number
    limit?: number
    offset?: number
    startTime?: Date
    endTime?: Date
  } = {}) {
    const { executionOrder, ...rest } = params
    return this.client.listRuns({
      ...rest,
      execution_order: executionOrder
    })
  }
}

// 导出单例实例
export const langsmith = new LangSmithClient() 