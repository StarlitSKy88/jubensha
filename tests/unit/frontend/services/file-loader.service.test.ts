import { describe, it, expect, vi, beforeEach } from 'vitest'
import { FileLoaderService, type ChunkConfig } from '../../src/services/file-loader.service'

describe('File Loader Service', () => {
  let service: FileLoaderService
  
  beforeEach(() => {
    service = new FileLoaderService({
      chunkSize: 1024,      // 1KB
      concurrency: 2,       // 同时加载2个分片
      retryTimes: 2,        // 失败重试2次
      retryDelay: 100       // 重试间隔100ms
    })
  })

  describe('File Loading', () => {
    it('should load file in chunks', async () => {
      // 创建测试文件
      const content = new Array(1024 * 4).fill('a').join('') // 4KB
      const file = new File([content], 'test.txt', { type: 'text/plain' })

      // 监听进度
      const progressEvents: any[] = []
      const onProgress = (progress: any) => {
        progressEvents.push(progress)
      }

      // 加载文件
      const result = await service.loadFile(file, onProgress)

      // 验证结果
      expect(result).toBeInstanceOf(ArrayBuffer)
      expect(result.byteLength).toBe(file.size)

      // 验证进度事件
      expect(progressEvents.length).toBeGreaterThan(0)
      expect(progressEvents[0].percentage).toBeLessThan(100)
      expect(progressEvents[progressEvents.length - 1].percentage).toBe(100)
    })

    it('should handle empty file', async () => {
      const file = new File([], 'empty.txt', { type: 'text/plain' })
      const result = await service.loadFile(file)
      expect(result.byteLength).toBe(0)
    })

    it('should handle large file', async () => {
      // 创建10MB的测试文件
      const content = new Array(1024 * 1024 * 10).fill('a').join('')
      const file = new File([content], 'large.txt', { type: 'text/plain' })

      const result = await service.loadFile(file)
      expect(result.byteLength).toBe(file.size)
    })
  })

  describe('Error Handling', () => {
    it('should retry on failure', async () => {
      const content = 'test content'
      const file = new File([content], 'test.txt', { type: 'text/plain' })

      // 模拟前两次失败，第三次成功
      let attempts = 0
      const originalSlice = File.prototype.slice
      vi.spyOn(File.prototype, 'slice').mockImplementation(function(this: File, start?: number, end?: number) {
        attempts++
        if (attempts <= 2) {
          throw new Error('Simulated failure')
        }
        return originalSlice.call(this, start, end)
      })

      const result = await service.loadFile(file)
      expect(result.byteLength).toBe(file.size)
      expect(attempts).toBe(3)
    })

    it('should throw error after max retries', async () => {
      const content = 'test content'
      const file = new File([content], 'test.txt', { type: 'text/plain' })

      // 模拟持续失败
      vi.spyOn(File.prototype, 'slice').mockImplementation(() => {
        throw new Error('Simulated failure')
      })

      await expect(service.loadFile(file)).rejects.toThrow('Simulated failure')
    })
  })

  describe('Cancellation', () => {
    it('should cancel loading', async () => {
      // 创建大文件以确保有足够时间取消
      const content = new Array(1024 * 1024).fill('a').join('')
      const file = new File([content], 'large.txt', { type: 'text/plain' })

      // 延迟取消加载
      setTimeout(() => {
        service.cancel()
      }, 100)

      await expect(service.loadFile(file)).rejects.toThrow('AbortError')
    })
  })

  describe('Progress Tracking', () => {
    it('should report accurate progress', async () => {
      const content = new Array(1024 * 4).fill('a').join('') // 4KB
      const file = new File([content], 'test.txt', { type: 'text/plain' })

      const progressEvents: any[] = []
      await service.loadFile(file, (progress) => {
        progressEvents.push(progress)
      })

      // 验证进度报告
      expect(progressEvents.length).toBeGreaterThan(0)
      progressEvents.forEach(progress => {
        expect(progress.loaded).toBeLessThanOrEqual(file.size)
        expect(progress.total).toBe(file.size)
        expect(progress.percentage).toBeLessThanOrEqual(100)
        expect(progress.percentage).toBeGreaterThanOrEqual(0)
        expect(progress.speed).toBeGreaterThan(0)
      })

      // 验证最终进度
      const lastProgress = progressEvents[progressEvents.length - 1]
      expect(lastProgress.loaded).toBe(file.size)
      expect(lastProgress.percentage).toBe(100)
    })
  })

  describe('Configuration', () => {
    it('should respect chunk size configuration', async () => {
      const smallChunkService = new FileLoaderService({
        chunkSize: 100,    // 100B chunks
        concurrency: 1
      })

      const content = new Array(1000).fill('a').join('') // 1000B
      const file = new File([content], 'test.txt', { type: 'text/plain' })

      const progressEvents: any[] = []
      await smallChunkService.loadFile(file, (progress) => {
        progressEvents.push(progress)
      })

      // 应该有大约10个进度事件（1000B / 100B）
      expect(progressEvents.length).toBeGreaterThanOrEqual(10)
    })

    it('should respect concurrency limits', async () => {
      const content = new Array(1024 * 10).fill('a').join('') // 10KB
      const file = new File([content], 'test.txt', { type: 'text/plain' })

      let maxConcurrent = 0
      let currentConcurrent = 0

      // 监控并发数
      const originalArrayBuffer = Blob.prototype.arrayBuffer
      vi.spyOn(Blob.prototype, 'arrayBuffer').mockImplementation(async function(this: Blob) {
        currentConcurrent++
        maxConcurrent = Math.max(maxConcurrent, currentConcurrent)
        
        const result = await originalArrayBuffer.call(this)
        currentConcurrent--
        return result
      })

      await service.loadFile(file)

      // 验证最大并发数不超过配置
      expect(maxConcurrent).toBeLessThanOrEqual(2)
    })
  })

  describe('File Integrity', () => {
    it('should maintain file integrity', async () => {
      const content = 'Hello, World!'
      const file = new File([content], 'test.txt', { type: 'text/plain' })

      const result = await service.loadFile(file)
      const loadedContent = new TextDecoder().decode(result)

      expect(loadedContent).toBe(content)
    })

    it('should handle binary files', async () => {
      const content = new Uint8Array([1, 2, 3, 4, 5])
      const file = new File([content], 'test.bin', { type: 'application/octet-stream' })

      const result = await service.loadFile(file)
      const loadedContent = new Uint8Array(result)

      expect(loadedContent).toEqual(content)
    })
  })
}) 