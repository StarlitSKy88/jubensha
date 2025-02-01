import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { usePerformanceMonitor, performanceUtils, globalPerformance, performanceLogger, alertManager, PERFORMANCE_CONFIG, type PerformanceAlert, type MetricType } from '../../src/utils/performance'

describe('Performance Monitor', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // 清理之前的性能指标
    const monitor = usePerformanceMonitor()
    monitor.clearMetrics()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should measure time correctly', () => {
    const monitor = usePerformanceMonitor()
    monitor.startMeasure('test')
    vi.advanceTimersByTime(100)
    monitor.endMeasure('test')
    
    const metrics = monitor.getMetrics()
    expect(metrics.test).toBeGreaterThan(0)
  })

  it('should clear metrics', () => {
    const monitor = usePerformanceMonitor()
    monitor.startMeasure('test')
    vi.advanceTimersByTime(100)
    monitor.endMeasure('test')
    monitor.clearMetrics()
    
    const metrics = monitor.getMetrics()
    expect(metrics.test).toBe(0)
  })
})

describe('Performance Utils', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should measure function execution time', async () => {
    const testFn = async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
      return 'result'
    }

    const result = await performanceUtils.measureFunction(testFn, 'testFn')
    expect(result).toBe('result')
  })
})

describe('Global Performance', () => {
  beforeEach(() => {
    globalPerformance.clear()
  })

  it('should record metrics correctly', () => {
    globalPerformance.record('test-component', 'render', 100)
    const metrics = globalPerformance.getComponentMetrics('test-component')
    
    expect(metrics).toHaveLength(1)
    expect(metrics[0].name).toBe('render')
    expect(metrics[0].duration).toBe(100)
  })

  it('should calculate summary correctly', () => {
    globalPerformance.record('test-component', 'render', 100)
    globalPerformance.record('test-component', 'render', 200)
    globalPerformance.record('test-component', 'render', 300)
    
    const allMetrics = globalPerformance.getAllMetrics()
    const summary = allMetrics['test-component'].summary
    
    expect(summary.count).toBe(3)
    expect(summary.average).toBe(200)
    expect(summary.min).toBe(100)
    expect(summary.max).toBe(300)
  })
})

describe('Alert Manager', () => {
  beforeEach(() => {
    alertManager.clearAlerts()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should trigger alerts when thresholds are exceeded', () => {
    const handler = vi.fn()
    alertManager.addHandler(handler)

    // 测试加载时间超过警告阈值
    performanceLogger.log('warning', 'frontend', 'Load time warning', {
      loadTime: PERFORMANCE_CONFIG.frontend.loadTime.warning + 1
    })

    expect(handler).toHaveBeenCalledWith(expect.objectContaining({
      level: 'warning',
      metric: expect.objectContaining({
        type: 'frontend.loadTime',
        value: PERFORMANCE_CONFIG.frontend.loadTime.warning + 1
      })
    }))

    // 测试加载时间超过错误阈值
    performanceLogger.log('error', 'frontend', 'Load time error', {
      loadTime: PERFORMANCE_CONFIG.frontend.loadTime.error + 1
    })

    expect(handler).toHaveBeenCalledWith(expect.objectContaining({
      level: 'error',
      metric: expect.objectContaining({
        type: 'frontend.loadTime',
        value: PERFORMANCE_CONFIG.frontend.loadTime.error + 1
      })
    }))
  })

  it('should filter alerts correctly', () => {
    // 添加测试告警
    const now = Date.now()
    const alerts: PerformanceAlert[] = [
      {
        level: 'warning',
        metric: {
          type: 'frontend.loadTime',
          value: 100,
          timestamp: now - 1000
        },
        threshold: 80,
        message: 'Test warning',
        timestamp: now - 1000
      },
      {
        level: 'error',
        metric: {
          type: 'resources.memory',
          value: 600,
          timestamp: now
        },
        threshold: 500,
        message: 'Test error',
        timestamp: now
      }
    ]

    alerts.forEach(alert => alertManager.trigger(alert))

    // 测试级别过滤
    expect(alertManager.getAlerts({ level: 'warning' })).toHaveLength(1)
    expect(alertManager.getAlerts({ level: 'error' })).toHaveLength(1)

    // 测试指标类型过滤
    expect(alertManager.getAlerts({ metricType: 'frontend.loadTime' })).toHaveLength(1)
    expect(alertManager.getAlerts({ metricType: 'resources.memory' })).toHaveLength(1)

    // 测试时间范围过滤
    expect(alertManager.getAlerts({ 
      startTime: now - 500,
      endTime: now + 500
    })).toHaveLength(1)
  })

  it('should clean up old alerts', () => {
    const now = Date.now()
    vi.setSystemTime(now)

    // 添加一个旧的告警
    alertManager.trigger({
      level: 'warning',
      metric: {
        type: 'frontend.loadTime',
        value: 100,
        timestamp: now - (PERFORMANCE_CONFIG.sampling.retentionDays + 1) * 24 * 60 * 60 * 1000
      },
      threshold: 80,
      message: 'Old alert',
      timestamp: now - (PERFORMANCE_CONFIG.sampling.retentionDays + 1) * 24 * 60 * 60 * 1000
    })

    // 添加一个新的告警
    alertManager.trigger({
      level: 'warning',
      metric: {
        type: 'frontend.loadTime',
        value: 100,
        timestamp: now
      },
      threshold: 80,
      message: 'New alert',
      timestamp: now
    })

    // 验证旧告警被清理
    expect(alertManager.getAlerts()).toHaveLength(1)
    expect(alertManager.getAlerts()[0].message).toBe('New alert')
  })
})

describe('Performance Metrics', () => {
  beforeEach(() => {
    performanceLogger.clear()
    alertManager.clearAlerts()
  })

  it('should track all metric types', () => {
    const metricTypes: MetricType[] = [
      'frontend.loadTime',
      'frontend.renderTime',
      'frontend.scriptTime',
      'stability.crashRate',
      'stability.errorRate',
      'stability.dataLossRate',
      'resources.memory',
      'resources.cpu'
    ]

    metricTypes.forEach(type => {
      const [category, name] = type.split('.')
      performanceLogger.log('info', category, `Testing ${type}`, {
        [name]: PERFORMANCE_CONFIG[category][name].warning - 1
      })
    })

    const logs = performanceLogger.getLogs()
    expect(logs).toHaveLength(metricTypes.length)
    
    // 验证没有触发告警
    expect(alertManager.getAlerts()).toHaveLength(0)

    // 测试超过阈值
    metricTypes.forEach(type => {
      const [category, name] = type.split('.')
      performanceLogger.log('warning', category, `Testing ${type} warning`, {
        [name]: PERFORMANCE_CONFIG[category][name].error + 1
      })
    })

    // 验证触发了告警
    expect(alertManager.getAlerts()).toHaveLength(metricTypes.length)
  })
}) 