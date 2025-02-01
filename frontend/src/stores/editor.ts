import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { usePerformanceMonitor } from '@/utils/performance'

interface Line {
  id: string
  content: string
}

export const useEditorStore = defineStore('editor', () => {
  // 状态
  const lines = ref<Line[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  // 性能监控
  const { startMeasure, endMeasure } = usePerformanceMonitor('editor-store')
  
  // 计算属性
  const totalLines = computed(() => lines.value.length)
  const isEmpty = computed(() => totalLines.value === 0)
  
  // 加载内容
  const loadContent = async () => {
    startMeasure('load-content')
    
    try {
      isLoading.value = true
      error.value = null
      
      // 模拟加载数据
      const content = await fetch('/api/content').then(res => res.json())
      
      lines.value = content.lines.map((line: string, index: number) => ({
        id: `line-${index}`,
        content: line
      }))
    } catch (e) {
      error.value = e instanceof Error ? e.message : '加载失败'
    } finally {
      isLoading.value = false
      endMeasure('load-content')
    }
  }
  
  // 更新行内容
  const updateLine = (index: number, content: string) => {
    startMeasure('update-line')
    
    if (index >= 0 && index < lines.value.length) {
      lines.value[index] = {
        ...lines.value[index],
        content
      }
    }
    
    endMeasure('update-line')
  }
  
  // 插入新行
  const insertLine = (index: number, content: string = '') => {
    startMeasure('insert-line')
    
    const newLine: Line = {
      id: `line-${Date.now()}`,
      content
    }
    
    lines.value.splice(index, 0, newLine)
    
    endMeasure('insert-line')
  }
  
  // 删除行
  const deleteLine = (index: number) => {
    startMeasure('delete-line')
    
    if (index >= 0 && index < lines.value.length) {
      lines.value.splice(index, 1)
    }
    
    endMeasure('delete-line')
  }
  
  // 移动行
  const moveLine = (fromIndex: number, toIndex: number) => {
    startMeasure('move-line')
    
    if (
      fromIndex >= 0 && fromIndex < lines.value.length &&
      toIndex >= 0 && toIndex < lines.value.length
    ) {
      const line = lines.value[fromIndex]
      lines.value.splice(fromIndex, 1)
      lines.value.splice(toIndex, 0, line)
    }
    
    endMeasure('move-line')
  }
  
  // 清空内容
  const clearContent = () => {
    startMeasure('clear-content')
    
    lines.value = []
    error.value = null
    
    endMeasure('clear-content')
  }
  
  // 导出内容
  const exportContent = () => {
    startMeasure('export-content')
    
    const content = lines.value.map(line => line.content).join('\n')
    
    endMeasure('export-content')
    return content
  }
  
  // 导入内容
  const importContent = (content: string) => {
    startMeasure('import-content')
    
    lines.value = content.split('\n').map((line, index) => ({
      id: `line-${index}`,
      content: line
    }))
    
    endMeasure('import-content')
  }
  
  // 批量更新
  const batchUpdate = (updates: { index: number, content: string }[]) => {
    startMeasure('batch-update')
    
    updates.forEach(({ index, content }) => {
      if (index >= 0 && index < lines.value.length) {
        lines.value[index] = {
          ...lines.value[index],
          content
        }
      }
    })
    
    endMeasure('batch-update')
  }
  
  return {
    // 状态
    lines,
    isLoading,
    error,
    
    // 计算属性
    totalLines,
    isEmpty,
    
    // 方法
    loadContent,
    updateLine,
    insertLine,
    deleteLine,
    moveLine,
    clearContent,
    exportContent,
    importContent,
    batchUpdate
  }
}) 