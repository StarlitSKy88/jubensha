import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useEditorStore } from '@/stores/editor'

describe('Editor Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })
  
  const mockLines = Array.from({ length: 10 }, (_, i) => ({
    id: `line-${i}`,
    content: `Line ${i}`
  }))
  
  it('initializes with empty state', () => {
    const store = useEditorStore()
    expect(store.lines).toHaveLength(0)
    expect(store.isLoading).toBe(false)
    expect(store.error).toBeNull()
    expect(store.isEmpty).toBe(true)
    expect(store.totalLines).toBe(0)
  })
  
  it('loads content successfully', async () => {
    const store = useEditorStore()
    const mockContent = {
      lines: mockLines.map(line => line.content)
    }
    
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve(mockContent)
    })
    
    await store.loadContent()
    
    expect(store.lines).toHaveLength(mockLines.length)
    expect(store.isLoading).toBe(false)
    expect(store.error).toBeNull()
    expect(store.isEmpty).toBe(false)
    expect(store.totalLines).toBe(mockLines.length)
  })
  
  it('handles load content error', async () => {
    const store = useEditorStore()
    const errorMessage = 'Failed to load content'
    
    global.fetch = vi.fn().mockRejectedValue(new Error(errorMessage))
    
    await store.loadContent()
    
    expect(store.lines).toHaveLength(0)
    expect(store.isLoading).toBe(false)
    expect(store.error).toBe(errorMessage)
    expect(store.isEmpty).toBe(true)
  })
  
  it('updates line content', () => {
    const store = useEditorStore()
    store.lines = [...mockLines]
    
    const index = 5
    const newContent = 'Updated content'
    store.updateLine(index, newContent)
    
    expect(store.lines[index].content).toBe(newContent)
  })
  
  it('inserts new line', () => {
    const store = useEditorStore()
    store.lines = [...mockLines]
    
    const index = 5
    const content = 'New line'
    store.insertLine(index, content)
    
    expect(store.lines).toHaveLength(mockLines.length + 1)
    expect(store.lines[index].content).toBe(content)
  })
  
  it('deletes line', () => {
    const store = useEditorStore()
    store.lines = [...mockLines]
    
    const index = 5
    const lineToDelete = store.lines[index]
    store.deleteLine(index)
    
    expect(store.lines).toHaveLength(mockLines.length - 1)
    expect(store.lines).not.toContain(lineToDelete)
  })
  
  it('moves line', () => {
    const store = useEditorStore()
    store.lines = [...mockLines]
    
    const fromIndex = 5
    const toIndex = 8
    const lineToMove = store.lines[fromIndex]
    store.moveLine(fromIndex, toIndex)
    
    expect(store.lines[toIndex]).toEqual(lineToMove)
  })
  
  it('clears content', () => {
    const store = useEditorStore()
    store.lines = [...mockLines]
    store.error = 'Some error'
    
    store.clearContent()
    
    expect(store.lines).toHaveLength(0)
    expect(store.error).toBeNull()
    expect(store.isEmpty).toBe(true)
  })
  
  it('exports content', () => {
    const store = useEditorStore()
    store.lines = [...mockLines]
    
    const content = store.exportContent()
    const expectedContent = mockLines.map(line => line.content).join('\n')
    
    expect(content).toBe(expectedContent)
  })
  
  it('imports content', () => {
    const store = useEditorStore()
    const content = mockLines.map(line => line.content).join('\n')
    
    store.importContent(content)
    
    expect(store.lines).toHaveLength(mockLines.length)
    expect(store.lines.map(line => line.content)).toEqual(mockLines.map(line => line.content))
  })
  
  it('batch updates lines', () => {
    const store = useEditorStore()
    store.lines = [...mockLines]
    
    const updates = [
      { index: 2, content: 'Updated 2' },
      { index: 5, content: 'Updated 5' },
      { index: 8, content: 'Updated 8' }
    ]
    
    store.batchUpdate(updates)
    
    updates.forEach(({ index, content }) => {
      expect(store.lines[index].content).toBe(content)
    })
  })
  
  it('measures performance for all operations', () => {
    const startMeasure = vi.fn()
    const endMeasure = vi.fn()
    
    vi.mock('@/utils/performance', () => ({
      usePerformanceMonitor: () => ({
        startMeasure,
        endMeasure
      })
    }))
    
    const store = useEditorStore()
    
    // 测试所有操作的性能监控
    store.updateLine(0, 'test')
    expect(startMeasure).toHaveBeenCalledWith('update-line')
    expect(endMeasure).toHaveBeenCalledWith('update-line')
    
    store.insertLine(0, 'test')
    expect(startMeasure).toHaveBeenCalledWith('insert-line')
    expect(endMeasure).toHaveBeenCalledWith('insert-line')
    
    store.deleteLine(0)
    expect(startMeasure).toHaveBeenCalledWith('delete-line')
    expect(endMeasure).toHaveBeenCalledWith('delete-line')
    
    store.moveLine(0, 1)
    expect(startMeasure).toHaveBeenCalledWith('move-line')
    expect(endMeasure).toHaveBeenCalledWith('move-line')
    
    store.clearContent()
    expect(startMeasure).toHaveBeenCalledWith('clear-content')
    expect(endMeasure).toHaveBeenCalledWith('clear-content')
    
    store.exportContent()
    expect(startMeasure).toHaveBeenCalledWith('export-content')
    expect(endMeasure).toHaveBeenCalledWith('export-content')
    
    store.importContent('test')
    expect(startMeasure).toHaveBeenCalledWith('import-content')
    expect(endMeasure).toHaveBeenCalledWith('import-content')
    
    store.batchUpdate([{ index: 0, content: 'test' }])
    expect(startMeasure).toHaveBeenCalledWith('batch-update')
    expect(endMeasure).toHaveBeenCalledWith('batch-update')
  })
}) 