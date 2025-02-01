import jsPDF from 'jspdf'
import type { Script } from '@/types/script'
import type { ExportOptions } from './export.service'
import { usePerformanceMonitor } from '@/utils/performance'

export interface PDFOptions extends ExportOptions {
  pageSize?: 'a4' | 'letter'
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

export class PDFService {
  private monitor = usePerformanceMonitor()

  async exportToPdf(script: Script, options: PDFOptions): Promise<Blob> {
    this.monitor.startMeasure('export-pdf')

    try {
      const {
        pageSize = 'a4',
        orientation = 'portrait',
        margins = { top: 20, right: 20, bottom: 20, left: 20 },
        fontSize = { title: 24, heading: 16, body: 12 }
      } = options

      // 创建 PDF 文档
      const doc = new jsPDF({
        format: pageSize,
        orientation,
        unit: 'mm'
      })

      // 设置字体
      doc.setFont('helvetica')

      // 当前位置
      let y = margins.top

      // 添加标题
      doc.setFontSize(fontSize.title)
      doc.text(script.title, margins.left, y)
      y += 15

      // 添加元数据
      if (options.includeMetadata) {
        doc.setFontSize(fontSize.body)
        doc.text(`作者：${script.author}`, margins.left, y)
        y += 7
        doc.text(`创建时间：${new Date(script.createdAt).toLocaleString()}`, margins.left, y)
        y += 7
        doc.text(`更新时间：${new Date(script.updatedAt).toLocaleString()}`, margins.left, y)
        y += 10
      }

      // 添加角色列表
      if (options.includeCharacters) {
        doc.setFontSize(fontSize.heading)
        doc.text('角色列表', margins.left, y)
        y += 10

        doc.setFontSize(fontSize.body)
        script.characters.forEach((char) => {
          // 检查是否需要新页
          if (y > doc.internal.pageSize.height - margins.bottom) {
            doc.addPage()
            y = margins.top
          }

          doc.text(`${char.name}（${char.age}岁，${char.gender}）`, margins.left, y)
          y += 7
          doc.text(`职业：${char.occupation}`, margins.left, y)
          y += 7
          doc.text(`背景：${this.wrapText(char.background, doc, margins)}`, margins.left, y)
          y += 7
          doc.text(`性格：${char.personality.join('，')}`, margins.left, y)
          y += 10
        })
      }

      // 添加场景列表
      if (options.includeScenes) {
        // 检查是否需要新页
        if (y > doc.internal.pageSize.height - margins.bottom - 20) {
          doc.addPage()
          y = margins.top
        }

        doc.setFontSize(fontSize.heading)
        doc.text('场景列表', margins.left, y)
        y += 10

        doc.setFontSize(fontSize.body)
        script.scenes.forEach((scene) => {
          // 检查是否需要新页
          if (y > doc.internal.pageSize.height - margins.bottom) {
            doc.addPage()
            y = margins.top
          }

          doc.text(`场景：${scene.name}`, margins.left, y)
          y += 7
          doc.text(`位置：${scene.location}`, margins.left, y)
          y += 7
          doc.text(`时间：${scene.time}`, margins.left, y)
          y += 7
          doc.text(`描述：${this.wrapText(scene.description, doc, margins)}`, margins.left, y)
          y += 10
        })
      }

      // 添加线索列表
      if (options.includeClues) {
        // 检查是否需要新页
        if (y > doc.internal.pageSize.height - margins.bottom - 20) {
          doc.addPage()
          y = margins.top
        }

        doc.setFontSize(fontSize.heading)
        doc.text('线索列表', margins.left, y)
        y += 10

        doc.setFontSize(fontSize.body)
        script.clues.forEach((clue) => {
          // 检查是否需要新页
          if (y > doc.internal.pageSize.height - margins.bottom) {
            doc.addPage()
            y = margins.top
          }

          doc.text(`线索：${clue.name}`, margins.left, y)
          y += 7
          doc.text(`类型：${clue.type}`, margins.left, y)
          y += 7
          doc.text(`描述：${this.wrapText(clue.description, doc, margins)}`, margins.left, y)
          y += 7
          doc.text(`重要程度：${'★'.repeat(clue.importance)}`, margins.left, y)
          y += 10
        })
      }

      // 添加正文
      doc.addPage()
      y = margins.top

      doc.setFontSize(fontSize.heading)
      doc.text('正文', margins.left, y)
      y += 10

      doc.setFontSize(fontSize.body)
      const lines = this.wrapText(script.content, doc, margins).split('\n')
      lines.forEach((line) => {
        // 检查是否需要新页
        if (y > doc.internal.pageSize.height - margins.bottom) {
          doc.addPage()
          y = margins.top
        }

        doc.text(line, margins.left, y)
        y += 7
      })

      // 添加页眉
      if (options.header) {
        const pageCount = doc.internal.getNumberOfPages()
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i)
          doc.setFontSize(fontSize.body)
          doc.text(options.header, margins.left, 10)
        }
      }

      // 添加页脚
      if (options.footer) {
        const pageCount = doc.internal.getNumberOfPages()
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i)
          doc.setFontSize(fontSize.body)
          doc.text(
            `${options.footer} - 第 ${i} 页，共 ${pageCount} 页`,
            margins.left,
            doc.internal.pageSize.height - 10
          )
        }
      }

      return doc.output('blob')
    } finally {
      this.monitor.endMeasure('export-pdf')
    }
  }

  // 文本换行
  private wrapText(text: string, doc: jsPDF, margins: PDFOptions['margins']): string {
    if (!margins) return text

    const maxWidth = doc.internal.pageSize.width - margins.left - margins.right
    const lines: string[] = []
    let line = ''
    const words = text.split(' ')

    for (const word of words) {
      const testLine = line + word + ' '
      const testWidth = doc.getStringUnitWidth(testLine) * doc.getFontSize()

      if (testWidth > maxWidth && line !== '') {
        lines.push(line.trim())
        line = word + ' '
      } else {
        line = testLine
      }
    }

    if (line !== '') {
      lines.push(line.trim())
    }

    return lines.join('\n')
  }
} 