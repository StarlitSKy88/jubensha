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

interface PerformanceMetric {
  name: string
  startTime: number
  endTime: number
  duration: number
}

interface PerformanceMetrics {
  [key: string]: PerformanceMetric[]
}

interface MetricsSummary {
  count: number
  average: number
  max: number
  min: number
  p95: number
}

export function usePerformanceMonitor(componentName: string) {
  const metrics: Ref<PerformanceMetrics> = ref({})
  const measurementStack = new Map<string, number>()
  
  // 开始测量
  const startMeasure = (name: string): void => {
    measurementStack.set(name, performance.now())
  }
  
  // 结束测量
  const endMeasure = (name: string): void => {
    const startTime = measurementStack.get(name)
    if (startTime === undefined) return
    
    const endTime = performance.now()
    const duration = endTime - startTime
    
    if (!metrics.value[name]) {
      metrics.value[name] = []
    }
    
    metrics.value[name].push({
      name,
      startTime,
      endTime,
      duration
    })
    
    // 只保留最近的100条记录
    if (metrics.value[name].length > 100) {
      metrics.value[name].shift()
    }
    
    // 输出性能日志
    console.log(`[${componentName}] ${name}: ${duration.toFixed(2)}ms`)
  }
  
  // 获取性能指标
  const getMetrics = (): Record<string, number> => {
    const result: Record<string, number> = {}
    
    Object.entries(metrics.value).forEach(([name, measurements]) => {
      if (measurements.length === 0) return
      
      // 计算平均值
      const average = measurements.reduce((sum: number, m: PerformanceMetric) => sum + m.duration, 0) / measurements.length
      
      // 计算最大值
      const max = Math.max(...measurements.map((m: PerformanceMetric) => m.duration))
      
      // 计算最小值
      const min = Math.min(...measurements.map((m: PerformanceMetric) => m.duration))
      
      // 计算95th百分位数
      const sorted = measurements.map((m: PerformanceMetric) => m.duration).sort((a, b) => a - b)
      const p95 = sorted[Math.floor(sorted.length * 0.95)]
      
      result[`${name}_avg`] = average
      result[`${name}_max`] = max
      result[`${name}_min`] = min
      result[`${name}_p95`] = p95
    })
    
    return result
  }
  
  // 清除指标
  const clearMetrics = (): void => {
    metrics.value = {}
    measurementStack.clear()
  }
  
  // 添加标记
  const mark = (name: string): void => {
    performance.mark(`${componentName}-${name}`)
  }
  
  // 测量两个标记之间的时间
  const measure = (name: string, startMark: string, endMark: string): void => {
    performance.measure(
      `${componentName}-${name}`,
      `${componentName}-${startMark}`,
      `${componentName}-${endMark}`
    )
  }
  
  return {
    startMeasure,
    endMeasure,
    getMetrics,
    clearMetrics,
    mark,
    measure
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