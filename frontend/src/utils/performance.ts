import { type Ref } from 'vue'
import type { Router, RouteLocationNormalized } from 'vue-router'
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'

// 自定义节流和防抖函数类型
type ThrottledFunction<T extends (...args: any[]) => any> = {
  (...args: Parameters<T>): ReturnType<T>
  cancel: () => void
}

type DebouncedFunction<T extends (...args: any[]) => any> = {
  (...args: Parameters<T>): ReturnType<T>
  cancel: () => void
}

// 性能日志类型
interface PerformanceLogEntry {
  timestamp: number
  level: 'info' | 'warning' | 'error'
  category: string
  message: string
  metrics?: Record<string, number>
}

// 性能日志记录器类型
interface PerformanceLogger {
  logs: PerformanceLogEntry[]
  info: (category: string, message: string, metrics?: Record<string, number>) => void
  warning: (category: string, message: string, metrics?: Record<string, number>) => void
  error: (category: string, message: string, metrics?: Record<string, number>) => void
  getLogs: (category?: string) => PerformanceLogEntry[]
  getRecentLogs: (minutes?: number) => PerformanceLogEntry[]
  clear: () => void
}

// 性能监控配置和阈值
export const PERFORMANCE_CONFIG = {
  // 前端性能指标
  frontend: {
    loadTime: {
      warning: 80,   // 80ms
      error: 100,    // 100ms (编辑器响应时间要求)
    },
    renderTime: {
      warning: 800,  // 800ms
      error: 1000,   // 1s (文件加载时间要求)
    },
    scriptTime: {
      warning: 1500, // 1.5s
      error: 2000,   // 2s (AI响应时间要求)
    }
  },
  
  // 稳定性指标
  stability: {
    crashRate: {
      warning: 0.05, // 0.05%
      error: 0.1,    // 0.1% (崩溃率要求)
    },
    errorRate: {
      warning: 0.5,  // 0.5%
      error: 1.0,    // 1% (错误率要求)
    },
    dataLossRate: {
      warning: 0,    // 0%
      error: 0,      // 0% (数据丢失率要求)
    }
  },
  
  // 资源使用指标
  resources: {
    memory: {
      warning: 400,  // 400MB
      error: 500,    // 500MB (内存占用要求)
    },
    cpu: {
      warning: 50,   // 50%
      error: 70,     // 70%
    }
  },
  
  // 监控采样配置
  sampling: {
    normalInterval: 5000,     // 5s
    warningInterval: 2000,    // 2s
    errorInterval: 1000,      // 1s
    maxSampleSize: 1000,      // 最多保存1000条记录
    batchSize: 10,           // 批量处理大小
    retentionDays: 7,        // 数据保留7天
  }
}

// 告警管理器
export class AlertManager {
  private alerts: PerformanceAlert[] = []
  private handlers: ((alert: PerformanceAlert) => void)[] = []

  // 添加告警处理器
  addHandler(handler: (alert: PerformanceAlert) => void) {
    this.handlers.push(handler)
  }

  // 触发告警
  trigger(alert: PerformanceAlert) {
    this.alerts.push(alert)
    this.handlers.forEach(handler => handler(alert))

    // 清理过期告警
    const now = Date.now()
    const maxAge = PERFORMANCE_CONFIG.sampling.retentionDays * 24 * 60 * 60 * 1000
    this.alerts = this.alerts.filter(a => now - a.timestamp < maxAge)
  }

  // 获取告警
  getAlerts(options?: {
    level?: AlertLevel
    metricType?: MetricType
    startTime?: number
    endTime?: number
  }): PerformanceAlert[] {
    let filtered = this.alerts

    if (options?.level) {
      filtered = filtered.filter(a => a.level === options.level)
    }

    if (options?.metricType) {
      filtered = filtered.filter(a => a.metric.type === options.metricType)
    }

    if (options?.startTime) {
      filtered = filtered.filter(a => a.timestamp >= options.startTime!)
    }

    if (options?.endTime) {
      filtered = filtered.filter(a => a.timestamp <= options.endTime!)
    }

    return filtered
  }

  // 清理告警
  clearAlerts() {
    this.alerts = []
  }
}

// 创建全局告警管理器实例
export const alertManager = new AlertManager()

// 添加默认的告警处理器
alertManager.addHandler((alert) => {
  console.warn(`Performance Alert [${alert.level}]: ${alert.message}`, {
    metric: alert.metric,
    threshold: alert.threshold,
    timestamp: new Date(alert.timestamp).toISOString()
  })
})

// 修改性能监控实现，添加告警检查
function checkThresholds(metric: PerformanceMetric) {
  const [category, name] = metric.type.split('.')
  const thresholds = PERFORMANCE_CONFIG[category][name]

  if (metric.value > thresholds.error) {
    alertManager.trigger({
      level: 'error',
      metric,
      threshold: thresholds.error,
      message: `${metric.type} exceeded error threshold: ${metric.value}`,
      timestamp: Date.now()
    })
  } else if (metric.value > thresholds.warning) {
    alertManager.trigger({
      level: 'warning',
      metric,
      threshold: thresholds.warning,
      message: `${metric.type} exceeded warning threshold: ${metric.value}`,
      timestamp: Date.now()
    })
  }
}

// 性能日志记录器实现
export const performanceLogger: PerformanceLogger = {
  logs: [],

  info(category: string, message: string, metrics?: Record<string, number>) {
    this.log('info', category, message, metrics)
  },

  warning(category: string, message: string, metrics?: Record<string, number>) {
    this.log('warning', category, message, metrics)
  },

  error(category: string, message: string, metrics?: Record<string, number>) {
    this.log('error', category, message, metrics)
  },

  log(
    level: AlertLevel,
    category: string,
    message: string,
    metrics?: Record<string, number>
  ) {
    const logEntry: PerformanceLogEntry = {
      timestamp: Date.now(),
      level,
      category,
      message,
      metrics
    }

    this.logs.push(logEntry)

    if (this.logs.length > PERFORMANCE_CONFIG.sampling.maxSampleSize) {
      this.logs.shift()
    }

    // 检查性能指标是否超过阈值
    if (metrics) {
      Object.entries(metrics).forEach(([name, value]) => {
        const metricType = `${category}.${name}` as MetricType
        checkThresholds({
          type: metricType,
          value,
          timestamp: logEntry.timestamp
        })
      })
    }

    if (level === 'warning' || level === 'error') {
      this.report(logEntry)
    }
  },

  report(logEntry: PerformanceLogEntry) {
    console.warn('Performance issue:', logEntry)
  },

  getLogs(category?: string) {
    if (category) {
      return this.logs.filter(log => log.category === category)
    }
    return this.logs
  },

  getRecentLogs(minutes: number = 5) {
    const cutoff = Date.now() - minutes * 60 * 1000
    return this.logs.filter(log => log.timestamp >= cutoff)
  },

  clear() {
    this.logs = []
  }
}

// 修改性能监控实现
const metrics: PerformanceMetrics = {
  loadTime: 0,
  renderTime: 0,
  scriptTime: 0,
  editorUpdate: 0,
  scrollUpdate: 0,
  stateUpdate: 0
}

const marks = new Map<string, number>()

function createPerformanceMonitor(): PerformanceMonitor {
  return {
    startMeasure(name: string) {
      marks.set(name, performance.now())
      performanceLogger.info('measure', `Started measuring: ${name}`)
    },

    endMeasure(name: string) {
      const startTime = marks.get(name)
      if (startTime !== undefined) {
        const duration = performance.now() - startTime
        metrics[name] = duration
        marks.delete(name)

        if (name.startsWith('api-')) {
          if (duration > PERFORMANCE_CONFIG.api.responseTime.error) {
            performanceLogger.error('api', `API response time exceeded error threshold: ${name}`, { duration })
          } else if (duration > PERFORMANCE_CONFIG.api.responseTime.warning) {
            performanceLogger.warning('api', `API response time exceeded warning threshold: ${name}`, { duration })
          } else {
            performanceLogger.info('api', `API response time: ${name}`, { duration })
          }
        }
      }
    },

    getMetrics() {
      return { ...metrics }
    },

    clearMetrics() {
      Object.keys(metrics).forEach(key => {
        metrics[key] = 0
      })
      marks.clear()
    }
  }
}

// 导出单例实例
export const usePerformanceMonitor = (() => {
  let instance: PerformanceMonitor | null = null
  return () => {
    if (!instance) {
      instance = createPerformanceMonitor()
    }
    return instance
  }
})()

// 防抖函数类型
export type DebouncedFunction<T extends (...args: any[]) => any> = {
  (...args: Parameters<T>): void
  cancel: () => void
}

// 防抖函数
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): DebouncedFunction<T> {
  let timeout: ReturnType<typeof setTimeout> | null = null
  let result: ReturnType<T>

  const debounced = function(this: any, ...args: Parameters<T>) {
    const context = this

    if (timeout) clearTimeout(timeout)

    if (immediate) {
      const callNow = !timeout
      timeout = setTimeout(() => {
        timeout = null
      }, wait)
      if (callNow) result = func.apply(context, args)
    } else {
      timeout = setTimeout(() => {
        func.apply(context, args)
      }, wait)
    }

    return result
  } as DebouncedFunction<T>

  debounced.cancel = function() {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
  }

  return debounced
}

// 节流函数类型
export type ThrottledFunction<T extends (...args: any[]) => any> = {
  (...args: Parameters<T>): void
  cancel: () => void
}

// 节流函数
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options = { leading: true, trailing: true }
): ThrottledFunction<T> {
  let timeout: ReturnType<typeof setTimeout> | null = null
  let previous = 0
  let result: ReturnType<T>

  const throttled = function(this: any, ...args: Parameters<T>) {
    const now = Date.now()
    const context = this

    if (!previous && !options.leading) previous = now

    const remaining = wait - (now - previous)

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      previous = now
      result = func.apply(context, args)
    } else if (!timeout && options.trailing) {
      timeout = setTimeout(() => {
        previous = options.leading ? Date.now() : 0
        timeout = null
        result = func.apply(context, args)
      }, remaining)
    }

    return result
  } as ThrottledFunction<T>

  throttled.cancel = function() {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
    previous = 0
  }

  return throttled
}

// 批量处理函数类型
export type BatchProcessor<T> = {
  add: (item: T) => void
  flush: () => void
  clear: () => void
}

// 批量处理函数
export function createBatchProcessor<T>(
  processor: (items: T[]) => void,
  options = { maxSize: 100, maxWait: 1000 }
): BatchProcessor<T> {
  let items: T[] = []
  let timeout: ReturnType<typeof setTimeout> | null = null

  const flush = () => {
    if (items.length === 0) return
    processor(items)
    items = []
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
  }

  const add = (item: T) => {
    items.push(item)

    if (items.length >= options.maxSize) {
      flush()
    } else if (!timeout) {
      timeout = setTimeout(flush, options.maxWait)
    }
  }

  const clear = () => {
    items = []
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
  }

  return {
    add,
    flush,
    clear
  }
}

// 缓存函数类型
export type CacheOptions = {
  maxSize?: number
  maxAge?: number
}

// 缓存函数
export function createCache<K, V>(options: CacheOptions = {}) {
  const cache = new Map<K, { value: V; timestamp: number }>()
  const maxSize = options.maxSize || 1000
  const maxAge = options.maxAge || 5 * 60 * 1000 // 默认5分钟

  const set = (key: K, value: V) => {
    if (cache.size >= maxSize) {
      const oldestKey = cache.keys().next().value
      cache.delete(oldestKey)
    }

    cache.set(key, {
      value,
      timestamp: Date.now()
    })
  }

  const get = (key: K): V | undefined => {
    const item = cache.get(key)
    if (!item) return undefined

    if (Date.now() - item.timestamp > maxAge) {
      cache.delete(key)
      return undefined
    }

    return item.value
  }

  const clear = () => {
    cache.clear()
  }

  return {
    set,
    get,
    clear,
    size: () => cache.size
  }
}

import { ref, Ref } from 'vue'
import type { ThrottledFunction, DebouncedFunction } from '@vueuse/core'
import { type Router, type RouteLocationNormalized } from 'vue-router'
import { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios'

interface PerformanceMetric {
  name: string
  startTime: number
  endTime: number
  duration: number
}

interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  scriptTime: number
  editorUpdate: number
  scrollUpdate: number
  stateUpdate: number
  [key: string]: number
}

interface PerformanceMonitor {
  startMeasure: (name: string) => void
  endMeasure: (name: string) => void
  getMetrics: () => PerformanceMetrics
  clearMetrics: () => void
}

interface MetricsSummary {
  count: number
  average: number
  max: number
  min: number
  p95: number
}

declare global {
  interface HTMLElement {
    _performanceObserver?: PerformanceObserver
  }
  
  interface Performance {
    memory?: {
      usedJSHeapSize: number
      totalJSHeapSize: number
      jsHeapSizeLimit: number
    }
  }
}

const metrics: PerformanceMetrics = {
  loadTime: 0,
  renderTime: 0,
  scriptTime: 0,
  editorUpdate: 0,
  scrollUpdate: 0,
  stateUpdate: 0
}

const marks = new Map<string, number>()

const startMeasure = (name: string) => {
  marks.set(name, performance.now())
}

const endMeasure = (name: string) => {
  const startTime = marks.get(name)
  if (startTime !== undefined) {
    const duration = performance.now() - startTime
    metrics[name] = duration
    marks.delete(name)
  }
}

export function usePerformanceMonitor(): PerformanceMonitor {
  const startMeasure = (name: string) => {
    marks.set(name, performance.now())
  }

  const endMeasure = (name: string) => {
    const startTime = marks.get(name)
    if (startTime !== undefined) {
      const duration = performance.now() - startTime
      metrics[name] = duration
      marks.delete(name)
    }
  }

  const getMetrics = () => {
    return { ...metrics }
  }

  const clearMetrics = () => {
    Object.keys(metrics).forEach(key => {
      metrics[key] = 0
    })
    Object.keys(marks).forEach(key => {
      delete marks[key]
    })
  }

  return {
    startMeasure,
    endMeasure,
    getMetrics,
    clearMetrics
  }
}

// 性能监控装饰器
export function measure(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value

  descriptor.value = async function(...args: any[]) {
    const monitor = usePerformanceMonitor()
    monitor.startMeasure(propertyKey)
    
    try {
      const result = await originalMethod.apply(this, args)
      return result
    } finally {
      monitor.endMeasure(propertyKey)
    }
  }

  return descriptor
}

// 性能监控中间件
export function performanceMiddleware() {
  const monitor = usePerformanceMonitor()
  
  return async (ctx: any, next: () => Promise<void>) => {
    monitor.startMeasure('request')
    
    try {
      await next()
    } finally {
      monitor.endMeasure('request')
    }
  }
}

// 性能监控钩子
export function usePerformanceHook() {
  const monitor = usePerformanceMonitor()
  
  const measureEffect = (effect: () => void, name: string) => {
    monitor.startMeasure(name)
    effect()
    monitor.endMeasure(name)
  }
  
  const measureAsync = async <T>(fn: () => Promise<T>, name: string): Promise<T> => {
    monitor.startMeasure(name)
    try {
      return await fn()
    } finally {
      monitor.endMeasure(name)
    }
  }
  
  return {
    measureEffect,
    measureAsync
  }
}

// 性能监控插件
export const performancePlugin = {
  install(app: any) {
    const monitor = usePerformanceMonitor()
    
    app.config.globalProperties.$performance = monitor
    
    app.mixin({
      beforeCreate() {
        monitor.startMeasure('component')
      },
      mounted() {
        monitor.endMeasure('component')
      }
    })
  }
}

// 性能监控指令
export const vPerformance = {
  mounted(el: HTMLElement, binding: any) {
    const monitor = usePerformanceMonitor()
    const name = binding.value || 'interaction'
    
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach(entry => {
        monitor.startMeasure(`${name}-${entry.name}`)
        requestAnimationFrame(() => {
          monitor.endMeasure(`${name}-${entry.name}`)
        })
      })
    })
    
    observer.observe({ entryTypes: ['element', 'event'] })
    
    el._performanceObserver = observer
  },
  
  unmounted(el: HTMLElement) {
    if (el._performanceObserver) {
      el._performanceObserver.disconnect()
    }
  }
}

// 性能监控工具函数
export const performanceUtils = {
  // 测量函数执行时间
  measureFunction: async <T>(fn: () => Promise<T> | T, name: string): Promise<T> => {
    const monitor = usePerformanceMonitor()
    monitor.startMeasure(name)
    
    try {
      const result = await fn()
      return result
    } finally {
      monitor.endMeasure(name)
    }
  },
  
  // 测量组件渲染时间
  measureComponent: (component: any) => {
    const monitor = usePerformanceMonitor()
    const name = component.name || 'anonymous'
    
    return {
      beforeCreate() {
        monitor.startMeasure(`${name}-render`)
      },
      mounted() {
        monitor.endMeasure(`${name}-render`)
      },
      beforeUpdate() {
        monitor.startMeasure(`${name}-update`)
      },
      updated() {
        monitor.endMeasure(`${name}-update`)
      }
    }
  },
  
  // 测量路由切换时间
  measureRoute: (router: Router) => {
    const monitor = usePerformanceMonitor()
    
    router.beforeEach((to: RouteLocationNormalized) => {
      monitor.startMeasure(`route-${to.name}`)
    })
    
    router.afterEach((to: RouteLocationNormalized) => {
      monitor.endMeasure(`route-${to.name}`)
    })
  },
  
  // 测量API请求时间
  measureAPI: (axios: AxiosInstance) => {
    const monitor = usePerformanceMonitor()
    
    axios.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      monitor.startMeasure(`api-${config.url}`)
      return config
    })
    
    axios.interceptors.response.use(
      (response: AxiosResponse) => {
        monitor.endMeasure(`api-${response.config.url}`)
        return response
      },
      (error: AxiosError) => {
        if (error.config?.url) {
          monitor.endMeasure(`api-${error.config.url}`)
        }
        return Promise.reject(error)
      }
    )
  }
}

// 全局性能监控
export const globalPerformance = {
  metrics: new Map<string, PerformanceMetric[]>(),
  
  // 记录性能指标
  record(component: string, name: string, duration: number): void {
    const metrics = this.metrics.get(component) || []
    this.metrics.set(component, metrics)
    
    metrics.push({
      name,
      startTime: performance.now() - duration,
      endTime: performance.now(),
      duration
    })
    
    // 只保留最近的1000条记录
    if (metrics.length > 1000) {
      metrics.shift()
    }
  },
  
  // 获取组件的性能指标
  getComponentMetrics(component: string): PerformanceMetric[] {
    return this.metrics.get(component) || []
  },
  
  // 获取所有性能指标
  getAllMetrics(): Record<string, { metrics: PerformanceMetric[], summary: MetricsSummary }> {
    const result: Record<string, { metrics: PerformanceMetric[], summary: MetricsSummary }> = {}
    
    this.metrics.forEach((metrics, component) => {
      result[component] = {
        metrics,
        summary: this.calculateSummary(metrics)
      }
    })
    
    return result
  },
  
  // 计算性能指标摘要
  calculateSummary(metrics: PerformanceMetric[]): MetricsSummary {
    if (metrics.length === 0) {
      return {
        count: 0,
        average: 0,
        max: 0,
        min: 0,
        p95: 0
      }
    }
    
    const durations = metrics.map(m => m.duration)
    
    return {
      count: metrics.length,
      average: durations.reduce((a, b) => a + b, 0) / durations.length,
      max: Math.max(...durations),
      min: Math.min(...durations),
      p95: this.calculatePercentile(durations, 95)
    }
  },
  
  // 计算百分位数
  calculatePercentile(numbers: number[], percentile: number): number {
    if (numbers.length === 0) return 0
    
    const sorted = numbers.slice().sort((a, b) => a - b)
    const index = Math.floor(sorted.length * (percentile / 100))
    return sorted[index]
  },
  
  // 清除所有指标
  clear(): void {
    this.metrics.clear()
  }
}

// 性能指标类型
export type MetricType = 
  | 'frontend.loadTime'
  | 'frontend.renderTime'
  | 'frontend.scriptTime'
  | 'stability.crashRate'
  | 'stability.errorRate'
  | 'stability.dataLossRate'
  | 'resources.memory'
  | 'resources.cpu'

// 性能指标接口
export interface PerformanceMetric {
  type: MetricType
  value: number
  timestamp: number
  context?: Record<string, any>
}

// 告警级别
export type AlertLevel = 'info' | 'warning' | 'error'

// 告警接口
export interface PerformanceAlert {
  level: AlertLevel
  metric: PerformanceMetric
  threshold: number
  message: string
  timestamp: number
} 