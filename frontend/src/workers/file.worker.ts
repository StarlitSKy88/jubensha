interface FileChunk {
  id: string
  content: string
  lineStart: number
  lineEnd: number
}

interface ProcessResult {
  chunks: FileChunk[]
  totalLines: number
  processTime: number
}

// 文件处理函数
function processFile(content: string, chunkSize: number = 1000): ProcessResult {
  const startTime = performance.now()
  
  // 分割文件内容
  const lines = content.split('\n')
  const totalLines = lines.length
  const chunks: FileChunk[] = []
  
  // 分块处理
  for (let i = 0; i < lines.length; i += chunkSize) {
    const chunk: FileChunk = {
      id: `chunk-${Math.floor(i / chunkSize)}`,
      content: lines.slice(i, i + chunkSize).join('\n'),
      lineStart: i,
      lineEnd: Math.min(i + chunkSize, lines.length)
    }
    chunks.push(chunk)
    
    // 报告进度
    const progress = Math.round((i / lines.length) * 100)
    self.postMessage({ type: 'progress', data: progress })
  }
  
  const endTime = performance.now()
  
  return {
    chunks,
    totalLines,
    processTime: endTime - startTime
  }
}

// 搜索函数
function searchContent(chunks: FileChunk[], query: string): number[] {
  const results: number[] = []
  const regex = new RegExp(query, 'gi')
  
  chunks.forEach(chunk => {
    let match
    const lines = chunk.content.split('\n')
    
    lines.forEach((line, index) => {
      if (regex.test(line)) {
        results.push(chunk.lineStart + index)
      }
    })
  })
  
  return results
}

// 统计函数
function analyzeContent(chunks: FileChunk[]): Record<string, number> {
  const stats = {
    characters: 0,
    words: 0,
    lines: 0,
    paragraphs: 0
  }
  
  chunks.forEach(chunk => {
    const content = chunk.content
    stats.characters += content.length
    stats.words += content.split(/\s+/).length
    stats.lines += content.split('\n').length
    stats.paragraphs += content.split('\n\n').length
  })
  
  return stats
}

// 监听消息
self.addEventListener('message', (e: MessageEvent) => {
  const { type, data } = e.data
  
  switch (type) {
    case 'process':
      const { content, chunkSize } = data
      const result = processFile(content, chunkSize)
      self.postMessage({ type: 'processed', data: result })
      break
      
    case 'search':
      const { chunks, query } = data
      const searchResults = searchContent(chunks, query)
      self.postMessage({ type: 'searchResults', data: searchResults })
      break
      
    case 'analyze':
      const { chunks: contentChunks } = data
      const stats = analyzeContent(contentChunks)
      self.postMessage({ type: 'analyzed', data: stats })
      break
      
    default:
      self.postMessage({ type: 'error', data: 'Unknown command' })
  }
}) 