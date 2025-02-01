import { ref } from 'vue'
import { usePerformanceMonitor } from '@/utils/performance'

// 文件处理配置
export interface FileConfig {
  chunkSize: number
  concurrency: number
  retryTimes: number
  retryDelay: number
  maxFileSize: number
  allowedTypes: string[]
}

// 默认配置
const DEFAULT_CONFIG: FileConfig = {
  chunkSize: 1024 * 1024,    // 1MB
  concurrency: 3,            // 同时处理3个分片
  retryTimes: 3,            // 失败重试3次
  retryDelay: 1000,         // 重试间隔1秒
  maxFileSize: 100 * 1024 * 1024, // 100MB
  allowedTypes: ['image/*', 'video/*', 'audio/*', 'application/pdf']
}

// 文件状态
export interface FileStatus {
  id: string
  name: string
  size: number
  type: string
  progress: number
  status: 'pending' | 'processing' | 'success' | 'error'
  error?: Error
}

// 文件服务
export class FileService {
  private config: FileConfig
  private monitor = usePerformanceMonitor()
  private abortController: AbortController | null = null
  private fileStatus = ref<Map<string, FileStatus>>(new Map())

  constructor(config: Partial<FileConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  // 获取文件状态
  getStatus(fileId: string): FileStatus | undefined {
    return this.fileStatus.value.get(fileId)
  }

  // 获取所有文件状态
  getAllStatus(): Map<string, FileStatus> {
    return this.fileStatus.value
  }

  // 验证文件
  validateFile(file: File): { valid: boolean; error?: string } {
    // 检查文件大小
    if (file.size > this.config.maxFileSize) {
      return {
        valid: false,
        error: \`文件大小超过限制: \${this.config.maxFileSize / 1024 / 1024}MB\`
      }
    }

    // 检查文件类型
    const isTypeAllowed = this.config.allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        const baseType = type.split('/')[0]
        return file.type.startsWith(\`\${baseType}/\`)
      }
      return file.type === type
    })

    if (!isTypeAllowed) {
      return {
        valid: false,
        error: '不支持的文件类型'
      }
    }

    return { valid: true }
  }

  // 加载文件
  async loadFile(file: File): Promise<ArrayBuffer> {
    const fileId = crypto.randomUUID()
    this.monitor.startMeasure(\`file-load-\${fileId}\`)
    this.abortController = new AbortController()

    try {
      // 验证文件
      const validation = this.validateFile(file)
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      // 更新状态
      this.fileStatus.value.set(fileId, {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        progress: 0,
        status: 'processing'
      })

      // 创建分片
      const chunks = this.createChunks(file)
      const loadedChunks = new Array(chunks.length)
      let loadedSize = 0

      // 使用信号量控制并发
      const semaphore = new Array(this.config.concurrency).fill(null)

      // 加载所有分片
      while (chunks.length > 0 || semaphore.some(task => task !== null)) {
        // 填充信号量
        for (let i = 0; i < semaphore.length; i++) {
          if (semaphore[i] === null && chunks.length > 0) {
            const chunk = chunks.shift()!
            semaphore[i] = this.loadChunk(chunk, file).then(data => {
              loadedChunks[chunk.index] = data
              loadedSize += data.byteLength

              // 更新进度
              const status = this.fileStatus.value.get(fileId)
              if (status) {
                status.progress = (loadedSize / file.size) * 100
              }

              semaphore[i] = null
            }).catch(error => {
              chunks.push(chunk)
              semaphore[i] = null
              throw error
            })
          }
        }

        // 等待任意一个任务完成
        await Promise.race(semaphore.filter(task => task !== null))
      }

      // 合并分片
      const result = this.mergeChunks(loadedChunks)

      // 更新状态
      const status = this.fileStatus.value.get(fileId)
      if (status) {
        status.status = 'success'
        status.progress = 100
      }

      this.monitor.endMeasure(\`file-load-\${fileId}\`)
      return result

    } catch (error) {
      // 更新状态
      const status = this.fileStatus.value.get(fileId)
      if (status) {
        status.status = 'error'
        status.error = error as Error
      }

      this.monitor.endMeasure(\`file-load-\${fileId}\`)
      throw error
    } finally {
      this.abortController = null
    }
  }

  // 取消加载
  cancel(fileId?: string): void {
    if (fileId) {
      const status = this.fileStatus.value.get(fileId)
      if (status && status.status === 'processing') {
        status.status = 'error'
        status.error = new Error('已取消')
      }
    }

    if (this.abortController) {
      this.abortController.abort()
    }
  }

  // 清除状态
  clearStatus(fileId?: string): void {
    if (fileId) {
      this.fileStatus.value.delete(fileId)
    } else {
      this.fileStatus.value.clear()
    }
  }

  // 私有方法：创建分片
  private createChunks(file: File): Array<{ index: number; start: number; end: number; retries: number }> {
    const chunks = []
    let start = 0
    let index = 0

    while (start < file.size) {
      const end = Math.min(start + this.config.chunkSize, file.size)
      chunks.push({
        index,
        start,
        end,
        retries: 0
      })
      start = end
      index++
    }

    return chunks
  }

  // 私有方法：加载分片
  private async loadChunk(chunk: { index: number; start: number; end: number; retries: number }, file: File): Promise<ArrayBuffer> {
    try {
      const blob = file.slice(chunk.start, chunk.end)
      const buffer = await blob.arrayBuffer()
      return buffer
    } catch (error) {
      // 重试处理
      if (chunk.retries < this.config.retryTimes) {
        chunk.retries++
        await new Promise(resolve => setTimeout(resolve, this.config.retryDelay))
        return this.loadChunk(chunk, file)
      }
      throw error
    }
  }

  // 私有方法：合并分片
  private mergeChunks(chunks: ArrayBuffer[]): ArrayBuffer {
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.byteLength, 0)
    const result = new Uint8Array(totalLength)
    let offset = 0

    for (const chunk of chunks) {
      result.set(new Uint8Array(chunk), offset)
      offset += chunk.byteLength
    }

    return result.buffer
  }
} 