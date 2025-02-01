import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LangSmithClient } from '../../src/config/langsmith.config'

describe('LangSmith Client', () => {
  let client: LangSmithClient
  const mockDate = new Date('2024-03-28T12:00:00Z')

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(mockDate)
    
    client = new LangSmithClient({
      apiKey: 'test-api-key',
      projectName: 'test-project',
      environment: 'test',
      tracing: true
    })

    // Mock navigator properties
    Object.defineProperty(window, 'navigator', {
      value: {
        userAgent: 'test-agent',
        platform: 'test-platform',
        language: 'test-lang'
      },
      writable: true
    })

    // Mock performance properties
    Object.defineProperty(window, 'performance', {
      value: {
        memory: {
          jsHeapSizeLimit: 2000000000,
          totalJSHeapSize: 1000000000,
          usedJSHeapSize: 500000000
        },
        timing: {
          navigationStart: 1000,
          loadEventEnd: 2000,
          domComplete: 1800,
          domInteractive: 1500
        }
      },
      writable: true
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Performance Metrics', () => {
    it('should log metrics with timestamp', async () => {
      const metrics = new Map<string, number>([
        ['load_time', 100],
        ['process_time', 50]
      ])

      const createRunSpy = vi.spyOn(client['client'], 'createRun')
      await client.logMetrics(metrics)

      expect(createRunSpy).toHaveBeenCalledWith({
        name: 'performance_metrics',
        run_type: 'metrics',
        inputs: {
          load_time: 100,
          process_time: 50
        },
        outputs: {},
        extra: {
          project: 'test-project',
          environment: 'test',
          category: 'performance',
          timestamp: mockDate.toISOString()
        }
      })
    })
  })

  describe('Error Tracking', () => {
    it('should log errors with type and timestamp', async () => {
      const error = new Error('Test error')
      const createRunSpy = vi.spyOn(client['client'], 'createRun')
      await client.logError(error)

      expect(createRunSpy).toHaveBeenCalledWith({
        name: 'error_tracking',
        run_type: 'error',
        inputs: {
          message: 'Test error',
          stack: error.stack,
          type: 'Error'
        },
        outputs: {},
        extra: {
          project: 'test-project',
          environment: 'test',
          category: 'error',
          timestamp: mockDate.toISOString()
        }
      })
    })
  })

  describe('File Operations', () => {
    it('should log file operations with extended info', async () => {
      const file = new File(['test'], 'test.txt', { 
        type: 'text/plain',
        lastModified: mockDate.getTime()
      })
      const createRunSpy = vi.spyOn(client['client'], 'createRun')
      await client.logFileOperation('upload', file, 100)

      expect(createRunSpy).toHaveBeenCalledWith({
        name: 'file_operation',
        run_type: 'file',
        inputs: {
          operation: 'upload',
          fileName: 'test.txt',
          fileSize: 4,
          fileType: 'text/plain',
          lastModified: mockDate.toISOString()
        },
        outputs: {
          duration: 100,
          success: true
        },
        extra: {
          project: 'test-project',
          environment: 'test',
          category: 'file',
          operation: 'upload',
          timestamp: mockDate.toISOString()
        }
      })
    })
  })

  describe('User Actions', () => {
    it('should log user actions with system info', async () => {
      const details = {
        page: 'home',
        button: 'upload'
      }
      const createRunSpy = vi.spyOn(client['client'], 'createRun')
      await client.logUserAction('click', details)

      expect(createRunSpy).toHaveBeenCalledWith({
        name: 'user_action',
        run_type: 'user',
        inputs: {
          action: 'click',
          page: 'home',
          button: 'upload',
          userAgent: 'test-agent',
          platform: 'test-platform',
          language: 'test-lang'
        },
        outputs: {},
        extra: {
          project: 'test-project',
          environment: 'test',
          category: 'user',
          action: 'click',
          timestamp: mockDate.toISOString()
        }
      })
    })
  })

  describe('System Performance', () => {
    it('should log system performance metrics', async () => {
      const createRunSpy = vi.spyOn(client['client'], 'createRun')
      await client.logSystemPerformance()

      expect(createRunSpy).toHaveBeenCalledWith({
        name: 'system_performance',
        run_type: 'system',
        inputs: {
          userAgent: 'test-agent',
          platform: 'test-platform',
          memory: {
            jsHeapSizeLimit: 2000000000,
            totalJSHeapSize: 1000000000,
            usedJSHeapSize: 500000000
          },
          timing: {
            navigationStart: 1000,
            loadEventEnd: 2000,
            domComplete: 1800,
            domInteractive: 1500
          }
        },
        outputs: {},
        extra: {
          project: 'test-project',
          environment: 'test',
          category: 'system',
          timestamp: mockDate.toISOString()
        }
      })
    })
  })

  describe('Tracing Control', () => {
    it('should not log when tracing is disabled', async () => {
      const client = new LangSmithClient({
        apiKey: 'test-api-key',
        projectName: 'test-project',
        environment: 'test',
        tracing: false
      })

      const createRunSpy = vi.spyOn(client['client'], 'createRun')
      
      await client.logMetrics(new Map([['test', 1]]))
      await client.logError(new Error('test'))
      await client.logFileOperation('test', new File([], 'test.txt'), 1)
      await client.logUserAction('test', {})
      await client.logSystemPerformance()

      expect(createRunSpy).not.toHaveBeenCalled()
    })
  })
}) 