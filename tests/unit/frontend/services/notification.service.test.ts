import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NotificationService, type NotificationConfig } from '@/services/notification.service'
import type { PerformanceAlert } from '@/utils/performance'

describe('Notification Service', () => {
  let service: NotificationService
  
  beforeEach(() => {
    vi.useFakeTimers()
    service = new NotificationService({
      channels: {
        email: {
          enabled: true,
          config: {
            recipients: ['test@example.com']
          }
        },
        dingtalk: {
          enabled: true,
          config: {
            webhook: 'https://example.com/webhook'
          }
        }
      }
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Notification Rules', () => {
    it('should match correct rule for alert level', () => {
      const alert: PerformanceAlert = {
        level: 'error',
        metric: {
          type: 'frontend.loadTime',
          value: 2000,
          timestamp: Date.now()
        },
        threshold: 1000,
        message: 'Load time exceeded threshold',
        timestamp: Date.now()
      }

      const consoleSpy = vi.spyOn(console, 'log')
      service.notify(alert)

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Sending email'),
        expect.any(Object)
      )
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Sending DingTalk'),
        expect.any(Object)
      )
    })

    it('should respect channel enabled status', () => {
      service.setChannelEnabled('email', false)

      const alert: PerformanceAlert = {
        level: 'error',
        metric: {
          type: 'frontend.loadTime',
          value: 2000,
          timestamp: Date.now()
        },
        threshold: 1000,
        message: 'Load time exceeded threshold',
        timestamp: Date.now()
      }

      const consoleSpy = vi.spyOn(console, 'log')
      service.notify(alert)

      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('Sending email'),
        expect.any(Object)
      )
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Sending DingTalk'),
        expect.any(Object)
      )
    })
  })

  describe('Notification Throttling', () => {
    it('should throttle notifications', async () => {
      const alert: PerformanceAlert = {
        level: 'error',
        metric: {
          type: 'frontend.loadTime',
          value: 2000,
          timestamp: Date.now()
        },
        threshold: 1000,
        message: 'Load time exceeded threshold',
        timestamp: Date.now()
      }

      const consoleSpy = vi.spyOn(console, 'log')
      
      // 第一次通知
      await service.notify(alert)
      expect(consoleSpy).toHaveBeenCalled()
      
      consoleSpy.mockClear()
      
      // 1分钟后的通知应该被节流
      vi.advanceTimersByTime(60 * 1000)
      await service.notify(alert)
      expect(consoleSpy).not.toHaveBeenCalled()
      
      // 5分钟后的通知应该被发送
      vi.advanceTimersByTime(4 * 60 * 1000)
      await service.notify(alert)
      expect(consoleSpy).toHaveBeenCalled()
    })
  })

  describe('Template Rendering', () => {
    it('should render template correctly', () => {
      const alert: PerformanceAlert = {
        level: 'error',
        metric: {
          type: 'frontend.loadTime',
          value: 2000,
          timestamp: Date.now()
        },
        threshold: 1000,
        message: 'Load time exceeded threshold',
        timestamp: Date.now()
      }

      const consoleSpy = vi.spyOn(console, 'log')
      service.notify(alert)

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Load time exceeded threshold'),
        expect.any(Object)
      )
    })

    it('should support custom templates', () => {
      service.addTemplate('custom', {
        title: 'Custom Alert: {level}',
        content: 'Value: {value}, Threshold: {threshold}'
      })

      service.updateRules([
        {
          level: 'error',
          channels: ['email'],
          template: 'custom'
        }
      ])

      const alert: PerformanceAlert = {
        level: 'error',
        metric: {
          type: 'frontend.loadTime',
          value: 2000,
          timestamp: Date.now()
        },
        threshold: 1000,
        message: 'Load time exceeded threshold',
        timestamp: Date.now()
      }

      const consoleSpy = vi.spyOn(console, 'log')
      service.notify(alert)

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Value: 2000, Threshold: 1000'),
        expect.any(Object)
      )
    })
  })

  describe('Channel Configuration', () => {
    it('should update channel config', () => {
      const newConfig = {
        recipients: ['new@example.com']
      }

      service.updateChannelConfig('email', newConfig)

      const alert: PerformanceAlert = {
        level: 'error',
        metric: {
          type: 'frontend.loadTime',
          value: 2000,
          timestamp: Date.now()
        },
        threshold: 1000,
        message: 'Load time exceeded threshold',
        timestamp: Date.now()
      }

      const consoleSpy = vi.spyOn(console, 'log')
      service.notify(alert)

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Sending email'),
        expect.objectContaining({
          config: expect.objectContaining({
            recipients: ['new@example.com']
          })
        })
      )
    })
  })

  describe('Error Handling', () => {
    it('should handle channel errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error')
      const alert: PerformanceAlert = {
        level: 'error',
        metric: {
          type: 'frontend.loadTime',
          value: 2000,
          timestamp: Date.now()
        },
        threshold: 1000,
        message: 'Load time exceeded threshold',
        timestamp: Date.now()
      }

      // 模拟发送失败
      vi.spyOn(console, 'log').mockImplementation(() => {
        throw new Error('Send failed')
      })

      await service.notify(alert)

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to send notification'),
        expect.any(Error)
      )
    })
  })
}) 