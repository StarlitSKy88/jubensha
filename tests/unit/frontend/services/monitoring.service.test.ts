import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MonitoringService, type MonitoringConfig } from '@/services/monitoring.service'
import { performanceStorage } from '@/services/performance.service'
import type { PerformanceMetric } from '@/utils/performance'

describe('Monitoring Service', () => {
  let service: MonitoringService
  let mockFetch: ReturnType<typeof vi.fn>
  
  beforeEach(() => {
    vi.useFakeTimers()
    
    // 模拟fetch
    mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      statusText: 'OK'
    })
    global.fetch = mockFetch
    
    // 创建服务实例
    service = new MonitoringService({
      system: 'prometheus',
      endpoint: 'http://localhost:9090/metrics',
      interval: 10000,
      labels: {
        app: 'test-app',
        env: 'test'
      }
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    service.stop()
  })

  describe('Metric Export', () => {
    it('should format metrics correctly for Prometheus', async () => {
      const metrics: PerformanceMetric[] = [
        {
          type: 'frontend.loadTime',
          value: 100,
          timestamp: Date.now()
        }
      ]

      // 模拟存储服务
      vi.spyOn(performanceStorage, 'getMetrics').mockResolvedValue(metrics)

      await service.exportMetrics()

      expect(mockFetch).toHaveBeenCalled()
      const [url, options] = mockFetch.mock.calls[0]
      
      expect(url).toBe('http://localhost:9090/metrics')
      expect(options.method).toBe('POST')
      expect(options.body).toMatch(/performance_metric{app="test-app",env="test",type="frontend.loadTime"} 100 \d+/)
    })

    it('should handle empty metrics', async () => {
      vi.spyOn(performanceStorage, 'getMetrics').mockResolvedValue([])

      await service.exportMetrics()

      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should handle fetch errors', async () => {
      const metrics: PerformanceMetric[] = [
        {
          type: 'frontend.loadTime',
          value: 100,
          timestamp: Date.now()
        }
      ]

      vi.spyOn(performanceStorage, 'getMetrics').mockResolvedValue(metrics)
      mockFetch.mockRejectedValue(new Error('Network error'))

      const consoleSpy = vi.spyOn(console, 'error')
      
      await expect(service.exportMetrics()).rejects.toThrow('Network error')
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to send metrics'),
        expect.any(Error)
      )
    })
  })

  describe('Service Lifecycle', () => {
    it('should start and stop correctly', async () => {
      const exportSpy = vi.spyOn(service, 'exportMetrics')

      await service.start()
      expect(exportSpy).toHaveBeenCalledTimes(1)

      vi.advanceTimersByTime(10000)
      expect(exportSpy).toHaveBeenCalledTimes(2)

      service.stop()
      vi.advanceTimersByTime(10000)
      expect(exportSpy).toHaveBeenCalledTimes(2)
    })

    it('should not start multiple times', async () => {
      const exportSpy = vi.spyOn(service, 'exportMetrics')

      await service.start()
      await service.start()

      expect(exportSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('Configuration', () => {
    it('should update configuration', async () => {
      const metrics: PerformanceMetric[] = [
        {
          type: 'frontend.loadTime',
          value: 100,
          timestamp: Date.now()
        }
      ]

      vi.spyOn(performanceStorage, 'getMetrics').mockResolvedValue(metrics)

      service.updateConfig({
        endpoint: 'http://new-endpoint/metrics',
        labels: {
          app: 'new-app'
        }
      })

      await service.exportMetrics()

      expect(mockFetch).toHaveBeenCalled()
      const [url, options] = mockFetch.mock.calls[0]
      
      expect(url).toBe('http://new-endpoint/metrics')
      expect(options.body).toMatch(/performance_metric{app="new-app",type="frontend.loadTime"} 100 \d+/)
    })

    it('should handle authentication', async () => {
      const metrics: PerformanceMetric[] = [
        {
          type: 'frontend.loadTime',
          value: 100,
          timestamp: Date.now()
        }
      ]

      vi.spyOn(performanceStorage, 'getMetrics').mockResolvedValue(metrics)

      // 测试Token认证
      service.updateConfig({
        auth: {
          token: 'test-token'
        }
      })

      await service.exportMetrics()

      expect(mockFetch).toHaveBeenCalled()
      expect(mockFetch.mock.calls[0][1].headers).toEqual(
        expect.objectContaining({
          'Authorization': 'Bearer test-token'
        })
      )

      // 测试Basic认证
      service.updateConfig({
        auth: {
          username: 'user',
          password: 'pass'
        }
      })

      await service.exportMetrics()

      expect(mockFetch).toHaveBeenCalled()
      expect(mockFetch.mock.calls[1][1].headers).toEqual(
        expect.objectContaining({
          'Authorization': 'Basic dXNlcjpwYXNz'
        })
      )
    })
  })

  describe('Error Handling', () => {
    it('should handle non-ok responses', async () => {
      const metrics: PerformanceMetric[] = [
        {
          type: 'frontend.loadTime',
          value: 100,
          timestamp: Date.now()
        }
      ]

      vi.spyOn(performanceStorage, 'getMetrics').mockResolvedValue(metrics)
      mockFetch.mockResolvedValue({
        ok: false,
        statusText: 'Internal Server Error'
      })

      const consoleSpy = vi.spyOn(console, 'error')
      
      await expect(service.exportMetrics()).rejects.toThrow('Failed to send metrics: Internal Server Error')
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to send metrics'),
        expect.any(Error)
      )
    })

    it('should handle storage errors', async () => {
      vi.spyOn(performanceStorage, 'getMetrics').mockRejectedValue(new Error('Storage error'))

      const consoleSpy = vi.spyOn(console, 'error')
      
      await expect(service.exportMetrics()).rejects.toThrow('Storage error')
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to export metrics'),
        expect.any(Error)
      )
    })
  })
}) 