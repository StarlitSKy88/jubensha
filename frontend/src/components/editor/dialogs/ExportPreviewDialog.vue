<template>
  <el-dialog
    title="导出预览"
    :visible="visible"
    width="80%"
    :fullscreen="isFullscreen"
    @close="handleClose"
  >
    <div class="preview-toolbar">
      <div class="toolbar-left">
        <el-button-group>
          <el-button
            :icon="isFullscreen ? 'el-icon-close' : 'el-icon-full-screen'"
            @click="isFullscreen = !isFullscreen"
          >
            {{ isFullscreen ? '退出全屏' : '全屏' }}
          </el-button>
          <el-button
            icon="el-icon-zoom-in"
            @click="handleZoomIn"
            :disabled="scale >= 2"
          >
            放大
          </el-button>
          <el-button
            icon="el-icon-zoom-out"
            @click="handleZoomOut"
            :disabled="scale <= 0.5"
          >
            缩小
          </el-button>
          <el-button
            icon="el-icon-refresh-right"
            @click="scale = 1"
          >
            重置
          </el-button>
        </el-button-group>

        <el-select
          v-model="currentPage"
          style="width: 120px; margin-left: 1rem"
        >
          <el-option
            v-for="page in totalPages"
            :key="page"
            :label="`第 ${page} 页`"
            :value="page"
          />
        </el-select>
      </div>

      <div class="toolbar-right">
        <el-button
          type="primary"
          :loading="loading"
          @click="handleExport"
        >
          导出
        </el-button>
      </div>
    </div>

    <div
      class="preview-content"
      :style="{
        transform: `scale(${scale})`,
        transformOrigin: 'top center'
      }"
    >
      <div
        v-for="page in previewPages"
        :key="page.index"
        class="preview-page"
        :class="{ active: currentPage === page.index }"
        :style="{
          width: `${pageWidth}mm`,
          minHeight: `${pageHeight}mm`,
          padding: `${margins.top}mm ${margins.right}mm ${margins.bottom}mm ${margins.left}mm`
        }"
      >
        <div class="page-header" v-if="header">
          {{ header }}
        </div>

        <div class="page-content" v-html="page.content" />

        <div class="page-footer" v-if="footer">
          {{ footer }} - 第 {{ page.index }} 页，共 {{ totalPages }} 页
        </div>

        <div class="page-number">{{ page.index }}</div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Script } from '@/types/script'
import type { ExportOptions } from '@/services/export/export.service'
import { ExportService } from '@/services/export/export.service'
import { usePerformanceMonitor } from '@/utils/performance'

const props = defineProps<{
  visible: boolean
  script: Script
  options: ExportOptions
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'export'): void
}>()

// 性能监控
const { startMeasure, endMeasure } = usePerformanceMonitor()

// 导出服务
const exportService = new ExportService()

// 状态
const loading = ref(false)
const isFullscreen = ref(false)
const scale = ref(1)
const currentPage = ref(1)
const previewPages = ref<{ index: number; content: string }[]>([])

// 页面设置
const pageSize = computed(() => props.options.pdfOptions?.pageSize || 'a4')
const orientation = computed(() => props.options.pdfOptions?.orientation || 'portrait')
const margins = computed(() => props.options.pdfOptions?.margins || {
  top: 20,
  right: 20,
  bottom: 20,
  left: 20
})
const header = computed(() => props.options.pdfOptions?.header || '')
const footer = computed(() => props.options.pdfOptions?.footer || '')

// 页面尺寸
const pageWidth = computed(() => {
  if (pageSize.value === 'a4') {
    return orientation.value === 'portrait' ? 210 : 297
  } else {
    return orientation.value === 'portrait' ? 216 : 279
  }
})

const pageHeight = computed(() => {
  if (pageSize.value === 'a4') {
    return orientation.value === 'portrait' ? 297 : 210
  } else {
    return orientation.value === 'portrait' ? 279 : 216
  }
})

const totalPages = computed(() => previewPages.value.length)

// 方法
const handleZoomIn = () => {
  if (scale.value < 2) {
    scale.value += 0.1
  }
}

const handleZoomOut = () => {
  if (scale.value > 0.5) {
    scale.value -= 0.1
  }
}

const handleExport = async () => {
  loading.value = true
  emit('export')
  loading.value = false
}

const handleClose = () => {
  emit('update:visible', false)
}

// 生成预览
const generatePreview = async () => {
  startMeasure('generate-preview')

  try {
    // 生成 HTML 内容
    const content = await generateContent()

    // 分页处理
    const pages = splitIntoPages(content)

    // 更新预览
    previewPages.value = pages.map((content, index) => ({
      index: index + 1,
      content
    }))

    currentPage.value = 1
  } catch (error) {
    console.error('生成预览失败：', error)
  } finally {
    endMeasure('generate-preview')
  }
}

// 生成内容
const generateContent = async () => {
  let content = ''

  // 添加标题
  content += `<h1 style="font-size: ${props.options.pdfOptions?.fontSize?.title || 24}px">${props.script.title}</h1>`

  // 添加元数据
  if (props.options.includeMetadata) {
    content += `
      <div class="metadata">
        <p>作者：${props.script.author}</p>
        <p>创建时间：${new Date(props.script.createdAt).toLocaleString()}</p>
        <p>更新时间：${new Date(props.script.updatedAt).toLocaleString()}</p>
      </div>
    `
  }

  // 添加角色列表
  if (props.options.includeCharacters) {
    content += `<h2 style="font-size: ${props.options.pdfOptions?.fontSize?.heading || 16}px">角色列表</h2>`
    props.script.characters.forEach((char) => {
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
  if (props.options.includeScenes) {
    content += `<h2 style="font-size: ${props.options.pdfOptions?.fontSize?.heading || 16}px">场景列表</h2>`
    props.script.scenes.forEach((scene) => {
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
  if (props.options.includeClues) {
    content += `<h2 style="font-size: ${props.options.pdfOptions?.fontSize?.heading || 16}px">线索列表</h2>`
    props.script.clues.forEach((clue) => {
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
  content += `<h2 style="font-size: ${props.options.pdfOptions?.fontSize?.heading || 16}px">正文</h2>`
  content += `<div class="content" style="font-size: ${props.options.pdfOptions?.fontSize?.body || 12}px">${props.script.content}</div>`

  return content
}

// 分页处理
const splitIntoPages = (content: string) => {
  // 创建临时容器
  const container = document.createElement('div')
  container.innerHTML = content
  container.style.width = `${pageWidth.value - margins.value.left - margins.value.right}mm`
  container.style.position = 'absolute'
  container.style.visibility = 'hidden'
  document.body.appendChild(container)

  // 计算每页高度
  const pageContentHeight = pageHeight.value - margins.value.top - margins.value.bottom
  if (header.value) {
    pageContentHeight -= 10 // 页眉高度
  }
  if (footer.value) {
    pageContentHeight -= 10 // 页脚高度
  }

  // 分页
  const pages: string[] = []
  let currentHeight = 0
  let currentContent = ''
  let currentElement = container.firstChild

  while (currentElement) {
    const element = currentElement as HTMLElement
    const elementHeight = element.offsetHeight

    if (currentHeight + elementHeight > pageContentHeight) {
      pages.push(currentContent)
      currentContent = ''
      currentHeight = 0
    }

    currentContent += element.outerHTML
    currentHeight += elementHeight
    currentElement = currentElement.nextSibling
  }

  if (currentContent) {
    pages.push(currentContent)
  }

  // 清理
  document.body.removeChild(container)

  return pages
}

// 监听变化
watch(() => props.visible, (visible) => {
  if (visible) {
    generatePreview()
  }
})
</script>

<style scoped lang="scss">
.preview-toolbar {
  padding: 1rem;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-content {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  transition: transform 0.2s;
}

.preview-page {
  background: white;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  position: relative;
  
  &.active {
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
  }
  
  .page-header {
    position: absolute;
    top: 5mm;
    left: 0;
    right: 0;
    text-align: center;
    color: var(--color-text-secondary);
    font-size: 0.875rem;
  }
  
  .page-footer {
    position: absolute;
    bottom: 5mm;
    left: 0;
    right: 0;
    text-align: center;
    color: var(--color-text-secondary);
    font-size: 0.875rem;
  }
  
  .page-number {
    position: absolute;
    bottom: 5mm;
    right: 5mm;
    color: var(--color-text-secondary);
    font-size: 0.875rem;
  }
}

:deep(.metadata) {
  margin: 1rem 0;
  color: var(--color-text-secondary);
}

:deep(.character),
:deep(.scene),
:deep(.clue) {
  margin: 1rem 0;
  
  h3 {
    margin: 0 0 0.5rem;
  }
  
  p {
    margin: 0.25rem 0;
  }
}

:deep(.content) {
  margin: 1rem 0;
  line-height: 1.6;
}
</style> 