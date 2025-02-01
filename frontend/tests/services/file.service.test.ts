import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { FileService } from '../../src/services/file.service'

// 定义 Mock 函数类型
type MockFunction = ReturnType<typeof vi.fn>

// 定义 Worker Mock 类型
interface WorkerMock extends Worker {
  addEventListener: MockFunction
  removeEventListener: MockFunction
  postMessage: MockFunction
  terminate: MockFunction
}

describe('File Service', () => {
  let service: FileService
  let mockWorker: WorkerMock
  
  beforeEach(() => {
    // 创建 Worker Mock
    mockWorker = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      postMessage: vi.fn(),
      terminate: vi.fn()
    } as unknown as WorkerMock
    
    // 模拟 Worker 构造函数
    vi.spyOn(window, 'Worker').mockImplementation(() => mockWorker)
    
    service = new FileService()
  })
  
  afterEach(() => {
    service.dispose()
    vi.clearAllMocks()
  })
  
  it('processes file correctly', async () => {
    const file = new File(['line1\nline2\nline3'], 'test.txt', { type: 'text/plain' })
    const mockResult = {
      chunks: [
        {
          id: 'chunk-0',
          content: 'line1\nline2\nline3',
          lineStart: 0,
          lineEnd: 3
        }
      ],
      totalLines: 3,
      processTime: 100
    }
    
    // 模拟 Worker 消息处理
    const messageHandler = mockWorker.addEventListener.mock.calls[0][1] as (e: MessageEvent) => void
    setTimeout(() => {
      messageHandler({
        data: { type: 'processed', data: mockResult }
      } as MessageEvent)
    }, 0)
    
    await service.processFile(file)
    
    expect(service.processing.value).toBe(false)
    expect(service.totalLines.value).toBe(3)
    expect(service.chunks.value).toEqual(mockResult.chunks)
  })
  
  it('handles file processing error', async () => {
    const file = new File([''], 'test.txt', { type: 'text/plain' })
    const error = new Error('Test error')
    
    // 模拟文件读取错误
    vi.spyOn(file, 'text').mockRejectedValue(error)
    
    await service.processFile(file)
    
    expect(service.processing.value).toBe(false)
    expect(service.error.value).toBe('Test error')
  })
  
  it('searches content correctly', async () => {
    const mockResults = [1, 3, 5]
    
    // 模拟Worker消息
    const messageHandler = mockWorker.addEventListener.mock.calls[0][1]
    setTimeout(() => {
      messageHandler({
        data: { type: 'searchResults', data: mockResults }
      })
    }, 0)
    
    const results = await service.searchContent('test')
    
    expect(results).toEqual(mockResults)
    expect(mockWorker.postMessage).toHaveBeenCalledWith({
      type: 'search',
      data: { chunks: [], query: 'test' }
    })
  })
  
  it('analyzes content correctly', async () => {
    const mockStats = {
      characters: 100,
      words: 20,
      lines: 5,
      paragraphs: 2
    }
    
    // 模拟Worker消息
    const messageHandler = mockWorker.addEventListener.mock.calls[0][1]
    setTimeout(() => {
      messageHandler({
        data: { type: 'analyzed', data: mockStats }
      })
    }, 0)
    
    await service.analyzeContent()
    
    expect(service.stats.value).toEqual(mockStats)
    expect(mockWorker.postMessage).toHaveBeenCalledWith({
      type: 'analyze',
      data: { chunks: [] }
    })
  })
  
  it('gets chunk correctly', () => {
    service.chunks.value = [
      {
        id: 'chunk-0',
        content: 'line1\nline2',
        lineStart: 0,
        lineEnd: 2
      },
      {
        id: 'chunk-1',
        content: 'line3\nline4',
        lineStart: 2,
        lineEnd: 4
      }
    ]
    
    const chunk = service.getChunk(2)
    expect(chunk).toEqual({
      id: 'chunk-1',
      content: 'line3\nline4',
      lineStart: 2,
      lineEnd: 4
    })
  })
  
  it('gets line correctly', () => {
    service.chunks.value = [
      {
        id: 'chunk-0',
        content: 'line1\nline2',
        lineStart: 0,
        lineEnd: 2
      },
      {
        id: 'chunk-1',
        content: 'line3\nline4',
        lineStart: 2,
        lineEnd: 4
      }
    ]
    
    const line = service.getLine(2)
    expect(line).toBe('line3')
  })
  
  it('gets lines correctly', () => {
    service.chunks.value = [
      {
        id: 'chunk-0',
        content: 'line1\nline2',
        lineStart: 0,
        lineEnd: 2
      },
      {
        id: 'chunk-1',
        content: 'line3\nline4',
        lineStart: 2,
        lineEnd: 4
      }
    ]
    
    const lines = service.getLines(1, 4)
    expect(lines).toEqual(['line2', 'line3', 'line4'])
  })
  
  it('updates progress correctly', () => {
    const messageHandler = mockWorker.addEventListener.mock.calls[0][1]
    messageHandler({
      data: { type: 'progress', data: 50 }
    })
    
    expect(service.progress.value).toBe(50)
  })
  
  it('handles worker error', () => {
    const messageHandler = mockWorker.addEventListener.mock.calls[0][1]
    messageHandler({
      data: { type: 'error', data: 'Test error' }
    })
    
    expect(service.error.value).toBe('Test error')
  })
  
  it('disposes worker correctly', () => {
    service.dispose()
    expect(mockWorker.terminate).toHaveBeenCalled()
  })
}) 