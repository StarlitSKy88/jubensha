import { ElMessage } from 'element-plus'

// 错误类型
export enum ErrorType {
  Network = 'network',
  Auth = 'auth',
  Validation = 'validation',
  Business = 'business',
  System = 'system'
}

// 错误信息接口
export interface ErrorInfo {
  type: ErrorType
  code: string
  message: string
  details?: any
  timestamp: number
  handled: boolean
}

// 错误处理配置
export interface ErrorHandlerConfig {
  showNotification?: boolean
  logToConsole?: boolean
  logToServer?: boolean
  retryCount?: number
  retryDelay?: number
}

// 默认配置
const defaultConfig: ErrorHandlerConfig = {
  showNotification: true,
  logToConsole: true,
  logToServer: true,
  retryCount: 3,
  retryDelay: 1000
}

// 错误处理类
export class ErrorHandler {
  private config: ErrorHandlerConfig
  private errors: ErrorInfo[] = []
  private retryMap = new Map<string, number>()

  constructor(config: Partial<ErrorHandlerConfig> = {}) {
    this.config = { ...defaultConfig, ...config }
  }

  // 处理错误
  handle(error: any, type: ErrorType = ErrorType.System): ErrorInfo {
    const errorInfo = this.createErrorInfo(error, type)
    
    // 添加到错误列表
    this.errors.push(errorInfo)
    
    // 显示通知
    if (this.config.showNotification) {
      this.showNotification(errorInfo)
    }
    
    // 控制台日志
    if (this.config.logToConsole) {
      this.logToConsole(errorInfo)
    }
    
    // 服务器日志
    if (this.config.logToServer) {
      this.logToServer(errorInfo)
    }
    
    return errorInfo
  }

  // 重试操作
  async retry<T>(
    operation: () => Promise<T>,
    key: string,
    type: ErrorType = ErrorType.Network
  ): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      const retryCount = this.retryMap.get(key) || 0
      
      if (retryCount < (this.config.retryCount || 0)) {
        this.retryMap.set(key, retryCount + 1)
        
        await new Promise(resolve => 
          setTimeout(resolve, this.config.retryDelay)
        )
        
        return this.retry(operation, key, type)
      }
      
      this.retryMap.delete(key)
      throw this.handle(error, type)
    }
  }

  // 获取错误列表
  getErrors(): ErrorInfo[] {
    return this.errors
  }

  // 清除错误
  clearErrors() {
    this.errors = []
    this.retryMap.clear()
  }

  // 创建错误信息
  private createErrorInfo(error: any, type: ErrorType): ErrorInfo {
    let code = 'UNKNOWN_ERROR'
    let message = '发生未知错误'
    let details = undefined
    
    if (error.response) {
      // Axios错误
      code = `HTTP_${error.response.status}`
      message = error.response.data?.message || error.message
      details = error.response.data
    } else if (error instanceof Error) {
      code = error.name
      message = error.message
      details = error.stack
    } else if (typeof error === 'string') {
      message = error
    }
    
    return {
      type,
      code,
      message,
      details,
      timestamp: Date.now(),
      handled: false
    }
  }

  // 显示通知
  private showNotification(error: ErrorInfo) {
    const messages: Record<ErrorType, string> = {
      [ErrorType.Network]: '网络连接错误',
      [ErrorType.Auth]: '认证失败',
      [ErrorType.Validation]: '数据验证失败',
      [ErrorType.Business]: '业务处理失败',
      [ErrorType.System]: '系统错误'
    }
    
    ElMessage.error({
      message: `${messages[error.type]}: ${error.message}`,
      duration: 5000
    })
  }

  // 控制台日志
  private logToConsole(error: ErrorInfo) {
    console.error('[Error]', {
      type: error.type,
      code: error.code,
      message: error.message,
      details: error.details,
      timestamp: new Date(error.timestamp).toISOString()
    })
  }

  // 服务器日志
  private async logToServer(error: ErrorInfo) {
    try {
      await fetch('/api/v1/logs/error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: error.type,
          code: error.code,
          message: error.message,
          details: error.details,
          timestamp: error.timestamp,
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      })
    } catch (e) {
      console.error('Failed to log error to server:', e)
    }
  }
} 