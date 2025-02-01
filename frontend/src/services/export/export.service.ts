import type { Script } from '@/types/script'
import { usePerformanceMonitor } from '@/utils/performance'
import { PDFService, type PDFOptions } from './pdf.service'
import { DocxService, type DocxOptions } from './docx.service'

export type ExportFormat = 'txt' | 'html' | 'pdf' | 'docx'

export interface ExportOptions {
  format: ExportFormat
  includeMetadata?: boolean
  includeCharacters?: boolean
  includeScenes?: boolean
  includeClues?: boolean
  customStyle?: string
  pdfOptions?: Omit<PDFOptions, keyof ExportOptions>
  docxOptions?: Omit<DocxOptions, keyof ExportOptions>
}

export class ExportService {
  private monitor = usePerformanceMonitor()
  private pdfService = new PDFService()
  private docxService = new DocxService()

  // 导出剧本
  async exportScript(script: Script, options: ExportOptions): Promise<Blob> {
    this.monitor.startMeasure('export-script')

    try {
      switch (options.format) {
        case 'txt':
          return await this.exportToTxt(script, options)
        case 'html':
          return await this.exportToHtml(script, options)
        case 'pdf':
          return await this.pdfService.exportToPdf(script, {
            ...options,
            ...options.pdfOptions
          })
        case 'docx':
          return await this.docxService.exportToDocx(script, {
            ...options,
            ...options.docxOptions
          })
        default:
          throw new Error(`不支持的导出格式：${options.format}`)
      }
    } finally {
      this.monitor.endMeasure('export-script')
    }
  }

  // 导出为纯文本
  private async exportToTxt(script: Script, options: ExportOptions): Promise<Blob> {
    this.monitor.startMeasure('export-txt')

    try {
      let content = ''

      // 添加标题
      content += `${script.title}\n\n`

      // 添加元数据
      if (options.includeMetadata) {
        content += `作者：${script.author}\n`
        content += `创建时间：${new Date(script.createdAt).toLocaleString()}\n`
        content += `更新时间：${new Date(script.updatedAt).toLocaleString()}\n\n`
      }

      // 添加角色列表
      if (options.includeCharacters) {
        content += '角色列表：\n\n'
        script.characters.forEach((char) => {
          content += `${char.name}（${char.age}岁，${char.gender}）\n`
          content += `职业：${char.occupation}\n`
          content += `背景：${char.background}\n`
          content += `性格：${char.personality.join('，')}\n\n`
        })
      }

      // 添加场景列表
      if (options.includeScenes) {
        content += '场景列表：\n\n'
        script.scenes.forEach((scene) => {
          content += `场景：${scene.name}\n`
          content += `位置：${scene.location}\n`
          content += `时间：${scene.time}\n`
          content += `描述：${scene.description}\n\n`
        })
      }

      // 添加线索列表
      if (options.includeClues) {
        content += '线索列表：\n\n'
        script.clues.forEach((clue) => {
          content += `线索：${clue.name}\n`
          content += `类型：${clue.type}\n`
          content += `描述：${clue.description}\n`
          content += `重要程度：${'★'.repeat(clue.importance)}\n\n`
        })
      }

      // 添加正文
      content += '正文：\n\n'
      content += script.content

      return new Blob([content], { type: 'text/plain;charset=utf-8' })
    } finally {
      this.monitor.endMeasure('export-txt')
    }
  }

  // 导出为 HTML
  private async exportToHtml(script: Script, options: ExportOptions): Promise<Blob> {
    this.monitor.startMeasure('export-html')

    try {
      let content = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${script.title}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              max-width: 800px;
              margin: 0 auto;
              padding: 2rem;
            }
            ${options.customStyle || ''}
          </style>
        </head>
        <body>
      `

      // 添加标题
      content += `<h1>${script.title}</h1>`

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
        content += '<h2>角色列表</h2>'
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
        content += '<h2>场景列表</h2>'
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
        content += '<h2>线索列表</h2>'
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
      content += '<h2>正文</h2>'
      content += `<div class="content">${script.content}</div>`

      content += `
        </body>
        </html>
      `

      return new Blob([content], { type: 'text/html;charset=utf-8' })
    } finally {
      this.monitor.endMeasure('export-html')
    }
  }

  // 导出为 DOCX
  private async exportToDocx(script: Script, options: ExportOptions): Promise<Blob> {
    // TODO: 实现 DOCX 导出
    throw new Error('DOCX 导出功能尚未实现')
  }
} 