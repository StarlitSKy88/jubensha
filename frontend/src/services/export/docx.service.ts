import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  PageOrientation,
  convertInchesToTwip,
  LevelFormat,
  PageNumber,
  Header,
  Footer,
  Table,
  TableRow,
  TableCell,
  BorderStyle
} from 'docx'
import type { Script } from '@/types/script'
import type { ExportOptions } from './export.service'
import { usePerformanceMonitor } from '@/utils/performance'
import { Packer } from 'docx'

export interface DocxOptions extends ExportOptions {
  pageSize?: 'A4' | 'Letter'
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

export class DocxService {
  private monitor = usePerformanceMonitor()

  async exportToDocx(script: Script, options: DocxOptions): Promise<Blob> {
    this.monitor.startMeasure('export-docx')

    try {
      const {
        pageSize = 'A4',
        orientation = 'portrait',
        margins = { top: 20, right: 20, bottom: 20, left: 20 },
        fontSize = { title: 24, heading: 16, body: 12 }
      } = options

      // 创建文档
      const doc = new Document({
        styles: {
          paragraphStyles: [
            {
              id: 'Title',
              name: 'Title',
              basedOn: 'Normal',
              next: 'Normal',
              quickFormat: true,
              run: {
                size: fontSize.title * 2,
                bold: true,
                color: '000000'
              },
              paragraph: {
                spacing: { after: 400 },
                alignment: AlignmentType.CENTER
              }
            },
            {
              id: 'Heading1',
              name: 'Heading 1',
              basedOn: 'Normal',
              next: 'Normal',
              quickFormat: true,
              run: {
                size: fontSize.heading * 2,
                bold: true,
                color: '000000'
              },
              paragraph: {
                spacing: { after: 200 }
              }
            },
            {
              id: 'Normal',
              name: 'Normal',
              next: 'Normal',
              quickFormat: true,
              run: {
                size: fontSize.body * 2,
                color: '000000'
              },
              paragraph: {
                spacing: { after: 200 }
              }
            }
          ]
        },
        sections: [{
          properties: {
            page: {
              size: {
                orientation: orientation === 'portrait' ? PageOrientation.PORTRAIT : PageOrientation.LANDSCAPE,
                width: pageSize === 'A4' ? 11906 : 12240, // A4: 210mm, Letter: 216mm
                height: pageSize === 'A4' ? 16838 : 15840 // A4: 297mm, Letter: 279mm
              },
              margin: {
                top: convertInchesToTwip(margins.top / 25.4),
                right: convertInchesToTwip(margins.right / 25.4),
                bottom: convertInchesToTwip(margins.bottom / 25.4),
                left: convertInchesToTwip(margins.left / 25.4)
              }
            }
          },
          headers: {
            default: new Header({
              children: options.header ? [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun(options.header)]
                })
              ] : []
            })
          },
          footers: {
            default: new Footer({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun(options.footer ? `${options.footer} - ` : ''),
                    new TextRun('第 '),
                    new TextRun({
                      children: [PageNumber.CURRENT]
                    }),
                    new TextRun(' 页，共 '),
                    new TextRun({
                      children: [PageNumber.TOTAL_PAGES]
                    }),
                    new TextRun(' 页')
                  ]
                })
              ]
            })
          },
          children: this.generateContent(script, options, fontSize)
        }]
      })

      // 导出为 Blob
      const buffer = await Packer.toBlob(doc)
      return buffer
    } finally {
      this.monitor.endMeasure('export-docx')
    }
  }

  private generateContent(script: Script, options: DocxOptions, fontSize: Required<DocxOptions['fontSize']>) {
    const content: (Paragraph | Table)[] = []

    // 添加标题
    content.push(
      new Paragraph({
        text: script.title,
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
        style: 'Title'
      })
    )

    // 添加元数据
    if (options.includeMetadata) {
      content.push(
        new Paragraph({
          children: [
            new TextRun({ text: '作者：', bold: true }),
            new TextRun(script.author)
          ],
          spacing: { after: 200 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: '创建时间：', bold: true }),
            new TextRun(new Date(script.createdAt).toLocaleString())
          ],
          spacing: { after: 200 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: '更新时间：', bold: true }),
            new TextRun(new Date(script.updatedAt).toLocaleString())
          ],
          spacing: { after: 400 }
        })
      )
    }

    // 添加角色列表
    if (options.includeCharacters) {
      content.push(
        new Paragraph({
          text: '角色列表',
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 200 },
          style: 'Heading1'
        })
      )

      script.characters.forEach((char) => {
        content.push(
          new Table({
            width: {
              size: 100,
              type: 'pct'
            },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 }
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 20,
                      type: 'pct'
                    },
                    children: [new Paragraph('姓名')]
                  }),
                  new TableCell({
                    width: {
                      size: 80,
                      type: 'pct'
                    },
                    children: [new Paragraph(`${char.name}（${char.age}岁，${char.gender}）`)]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 20,
                      type: 'pct'
                    },
                    children: [new Paragraph('职业')]
                  }),
                  new TableCell({
                    width: {
                      size: 80,
                      type: 'pct'
                    },
                    children: [new Paragraph(char.occupation)]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 20,
                      type: 'pct'
                    },
                    children: [new Paragraph('背景')]
                  }),
                  new TableCell({
                    width: {
                      size: 80,
                      type: 'pct'
                    },
                    children: [new Paragraph(char.background)]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 20,
                      type: 'pct'
                    },
                    children: [new Paragraph('性格')]
                  }),
                  new TableCell({
                    width: {
                      size: 80,
                      type: 'pct'
                    },
                    children: [new Paragraph(char.personality.join('，'))]
                  })
                ]
              })
            ]
          })
        )
        content.push(new Paragraph({ spacing: { after: 400 } }))
      })
    }

    // 添加场景列表
    if (options.includeScenes) {
      content.push(
        new Paragraph({
          text: '场景列表',
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 200 },
          style: 'Heading1'
        })
      )

      script.scenes.forEach((scene) => {
        content.push(
          new Table({
            width: {
              size: 100,
              type: 'pct'
            },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 }
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 20,
                      type: 'pct'
                    },
                    children: [new Paragraph('场景')]
                  }),
                  new TableCell({
                    width: {
                      size: 80,
                      type: 'pct'
                    },
                    children: [new Paragraph(scene.name)]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 20,
                      type: 'pct'
                    },
                    children: [new Paragraph('位置')]
                  }),
                  new TableCell({
                    width: {
                      size: 80,
                      type: 'pct'
                    },
                    children: [new Paragraph(scene.location)]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 20,
                      type: 'pct'
                    },
                    children: [new Paragraph('时间')]
                  }),
                  new TableCell({
                    width: {
                      size: 80,
                      type: 'pct'
                    },
                    children: [new Paragraph(scene.time)]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 20,
                      type: 'pct'
                    },
                    children: [new Paragraph('描述')]
                  }),
                  new TableCell({
                    width: {
                      size: 80,
                      type: 'pct'
                    },
                    children: [new Paragraph(scene.description)]
                  })
                ]
              })
            ]
          })
        )
        content.push(new Paragraph({ spacing: { after: 400 } }))
      })
    }

    // 添加线索列表
    if (options.includeClues) {
      content.push(
        new Paragraph({
          text: '线索列表',
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 200 },
          style: 'Heading1'
        })
      )

      script.clues.forEach((clue) => {
        content.push(
          new Table({
            width: {
              size: 100,
              type: 'pct'
            },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 }
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 20,
                      type: 'pct'
                    },
                    children: [new Paragraph('线索')]
                  }),
                  new TableCell({
                    width: {
                      size: 80,
                      type: 'pct'
                    },
                    children: [new Paragraph(clue.name)]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 20,
                      type: 'pct'
                    },
                    children: [new Paragraph('类型')]
                  }),
                  new TableCell({
                    width: {
                      size: 80,
                      type: 'pct'
                    },
                    children: [new Paragraph(clue.type)]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 20,
                      type: 'pct'
                    },
                    children: [new Paragraph('描述')]
                  }),
                  new TableCell({
                    width: {
                      size: 80,
                      type: 'pct'
                    },
                    children: [new Paragraph(clue.description)]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 20,
                      type: 'pct'
                    },
                    children: [new Paragraph('重要程度')]
                  }),
                  new TableCell({
                    width: {
                      size: 80,
                      type: 'pct'
                    },
                    children: [new Paragraph('★'.repeat(clue.importance))]
                  })
                ]
              })
            ]
          })
        )
        content.push(new Paragraph({ spacing: { after: 400 } }))
      })
    }

    // 添加正文
    content.push(
      new Paragraph({
        text: '正文',
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 200 },
        style: 'Heading1'
      })
    )

    // 分段处理正文
    const paragraphs = script.content.split('\n\n')
    paragraphs.forEach((text) => {
      if (text.trim()) {
        content.push(
          new Paragraph({
            text: text.trim(),
            spacing: { after: 200 },
            style: 'Normal'
          })
        )
      }
    })

    return content
  }
} 