import type { Script } from '@/types/script'
import type { ExportOptions } from './export.service'
import { usePerformanceMonitor } from '@/utils/performance'

export interface PreviewPage {
  index: number
  content: string
  width: number
  height: number
}

export interface PreviewOptions extends ExportOptions {
  pageSize?: 'a4' | 'letter' | 'A4' | 'Letter'
  orientation?: 'portrait' | 'landscape'
  margins?: {
    top: number
    right: number
    bottom: number
    left: number
  }
  fontSize?: {
    title: number
    heading: number
    body: number
  }
  header?: string
  footer?: string
}

export class PreviewService {
  private monitor = usePerformanceMonitor()

  async generatePreview(script: Script, options: PreviewOptions): Promise<PreviewPage[]> {
    this.monitor.startMeasure('generate-preview')

    try {
      // 生成 HTML 内容
      const content = await this.generateContent(script, options)

      // 计算页面尺寸
      const { pageWidth, pageHeight } = this.calculatePageSize(options)

      // 分页处理
      const pages = this.splitIntoPages(content, options, pageWidth, pageHeight)

      return pages
    } finally {
      this.monitor.endMeasure('generate-preview')
    }
  }

  private async generateContent(script: Script, options: PreviewOptions): Promise<string> {
    let content = ''

    // 添加标题
    content += `<h1 style="font-size: ${options.fontSize?.title || 24}px">${script.title}</h1>`

    // 添加元数据
    if (options.includeMetadata) {
      content += `
        <div class="metadata">
          <p>作者：${script.author}</p>
          <p>创建时间：${new Date(script.createdAt).toLocaleString()}</p>
          <p>更新时间：${new Date(script.updatedAt).toLocaleString()}</p>
        </div>
      `
    }

    // 添加角色列表
    if (options.includeCharacters) {
      content += `<h2 style="font-size: ${options.fontSize?.heading || 16}px">角色列表</h2>`
      script.characters.forEach((char) => {
        content += `
          <div class="character">
            <h3>${char.name}（${char.age}岁，${char.gender}）</h3>
            <p>职业：${char.occupation}</p>
            <p>背景：${char.background}</p>
            <p>性格：${char.personality.join('，')}</p>
          </div>
        `
      })
    }

    // 添加场景列表
    if (options.includeScenes) {
      content += `<h2 style="font-size: ${options.fontSize?.heading || 16}px">场景列表</h2>`
      script.scenes.forEach((scene) => {
        content += `
          <div class="scene">
            <h3>${scene.name}</h3>
            <p>位置：${scene.location}</p>
            <p>时间：${scene.time}</p>
            <p>描述：${scene.description}</p>
          </div>
        `
      })
    }

    // 添加线索列表
    if (options.includeClues) {
      content += `<h2 style="font-size: ${options.fontSize?.heading || 16}px">线索列表</h2>`
      script.clues.forEach((clue) => {
        content += `
          <div class="clue">
            <h3>${clue.name}</h3>
            <p>类型：${clue.type}</p>
            <p>描述：${clue.description}</p>
            <p>重要程度：${'★'.repeat(clue.importance)}</p>
          </div>
        `
      })
    }

    // 添加正文
    content += `<h2 style="font-size: ${options.fontSize?.heading || 16}px">正文</h2>`
    content += `<div class="content" style="font-size: ${options.fontSize?.body || 12}px">${script.content}</div>`

    return content
  }

  private calculatePageSize(options: PreviewOptions): { pageWidth: number; pageHeight: number } {
    const pageSize = options.pageSize?.toLowerCase() || 'a4'
    const orientation = options.orientation || 'portrait'

    if (pageSize === 'a4') {
      return orientation === 'portrait'
        ? { pageWidth: 210, pageHeight: 297 }
        : { pageWidth: 297, pageHeight: 210 }
    } else {
      return orientation === 'portrait'
        ? { pageWidth: 216, pageHeight: 279 }
        : { pageWidth: 279, pageHeight: 216 }
    }
  }

  private splitIntoPages(
    content: string,
    options: PreviewOptions,
    pageWidth: number,
    pageHeight: number
  ): PreviewPage[] {
    // 创建临时容器
    const container = document.createElement('div')
    container.innerHTML = content
    container.style.width = `${pageWidth - (options.margins?.left || 20) - (options.margins?.right || 20)}mm`
    container.style.position = 'absolute'
    container.style.visibility = 'hidden'
    document.body.appendChild(container)

    // 计算每页高度
    let pageContentHeight = pageHeight - (options.margins?.top || 20) - (options.margins?.bottom || 20)
    if (options.header) {
      pageContentHeight -= 10 // 页眉高度
    }
    if (options.footer) {
      pageContentHeight -= 10 // 页脚高度
    }

    // 分页
    const pages: PreviewPage[] = []
    let currentHeight = 0
    let currentContent = ''
    let currentElement = container.firstChild
    let pageIndex = 1

    while (currentElement) {
      const element = currentElement as HTMLElement
      const elementHeight = element.offsetHeight

      if (currentHeight + elementHeight > pageContentHeight) {
        pages.push({
          index: pageIndex++,
          content: currentContent,
          width: pageWidth,
          height: pageHeight
        })
        currentContent = ''
        currentHeight = 0
      }

      currentContent += element.outerHTML
      currentHeight += elementHeight
      currentElement = currentElement.nextSibling
    }

    if (currentContent) {
      pages.push({
        index: pageIndex,
        content: currentContent,
        width: pageWidth,
        height: pageHeight
      })
    }

    // 清理
    document.body.removeChild(container)

    return pages
  }
} 