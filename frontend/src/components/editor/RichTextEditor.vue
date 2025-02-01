# 富文本编辑器组件
<template>
  <div class="rich-text-editor">
    <div class="editor-toolbar">
      <div class="format-buttons">
        <el-button-group>
          <el-button
            v-for="item in formatButtons"
            :key="item.command"
            :icon="item.icon"
            :title="item.title"
            @click="executeCommand(item.command)"
          />
        </el-button-group>
      </div>

      <div class="style-buttons">
        <el-select v-model="currentHeading" @change="setHeading">
          <el-option
            v-for="item in headingOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>

        <el-color-picker
          v-model="currentColor"
          size="small"
          @change="setColor"
        />
      </div>
    </div>

    <div
      ref="editorRef"
      class="editor-content"
      contenteditable="true"
      @input="handleInput"
      @keydown="handleKeydown"
      @paste="handlePaste"
    />

    <div class="editor-footer">
      <div class="word-count">
        字数：{{ wordCount }}
      </div>
      <div class="ai-suggestions" v-if="aiSuggestions.length > 0">
        <div class="suggestion-title">AI 建议：</div>
        <div
          v-for="(suggestion, index) in aiSuggestions"
          :key="index"
          class="suggestion-item"
          @click="applySuggestion(suggestion)"
        >
          {{ suggestion.content }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { usePerformanceMonitor } from '@/utils/performance'
import type { WritingAdvice } from '@/types/ai'

const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
}>()

// 性能监控
const { startMeasure, endMeasure } = usePerformanceMonitor()

// 编辑器引用
const editorRef = ref<HTMLDivElement>()

// 状态
const currentHeading = ref('p')
const currentColor = ref('#000000')
const wordCount = ref(0)
const aiSuggestions = ref<WritingAdvice[]>([])

// 格式化按钮配置
const formatButtons = [
  { command: 'bold', icon: 'el-icon-bold', title: '加粗 (Ctrl+B)' },
  { command: 'italic', icon: 'el-icon-italic', title: '斜体 (Ctrl+I)' },
  { command: 'underline', icon: 'el-icon-underline', title: '下划线 (Ctrl+U)' },
  { command: 'strikeThrough', icon: 'el-icon-strikethrough', title: '删除线' },
  { command: 'justifyLeft', icon: 'el-icon-align-left', title: '左对齐' },
  { command: 'justifyCenter', icon: 'el-icon-align-center', title: '居中' },
  { command: 'justifyRight', icon: 'el-icon-align-right', title: '右对齐' },
  { command: 'insertOrderedList', icon: 'el-icon-list', title: '有序列表' },
  { command: 'insertUnorderedList', icon: 'el-icon-list-ul', title: '无序列表' },
  { command: 'indent', icon: 'el-icon-indent', title: '增加缩进' },
  { command: 'outdent', icon: 'el-icon-outdent', title: '减少缩进' }
]

// 标题选项
const headingOptions = [
  { value: 'p', label: '正文' },
  { value: 'h1', label: '标题 1' },
  { value: 'h2', label: '标题 2' },
  { value: 'h3', label: '标题 3' },
  { value: 'h4', label: '标题 4' }
]

// 方法
const executeCommand = (command: string) => {
  document.execCommand(command, false)
  updateContent()
}

const setHeading = (tag: string) => {
  if (tag === 'p') {
    document.execCommand('formatBlock', false, 'p')
  } else {
    document.execCommand('formatBlock', false, tag)
  }
  updateContent()
}

const setColor = (color: string) => {
  document.execCommand('foreColor', false, color)
  updateContent()
}

const handleInput = () => {
  updateContent()
}

const handleKeydown = (e: KeyboardEvent) => {
  // 处理快捷键
  if (e.ctrlKey || e.metaKey) {
    switch (e.key.toLowerCase()) {
      case 'b':
        e.preventDefault()
        executeCommand('bold')
        break
      case 'i':
        e.preventDefault()
        executeCommand('italic')
        break
      case 'u':
        e.preventDefault()
        executeCommand('underline')
        break
    }
  }
}

const handlePaste = (e: ClipboardEvent) => {
  e.preventDefault()
  
  // 获取纯文本
  const text = e.clipboardData?.getData('text/plain')
  if (text) {
    document.execCommand('insertText', false, text)
  }
}

const updateContent = () => {
  if (!editorRef.value) return

  startMeasure('update-content')
  
  const content = editorRef.value.innerHTML
  emit('update:modelValue', content)
  emit('change', content)
  
  // 更新字数统计
  const text = editorRef.value.textContent || ''
  wordCount.value = text.trim().length
  
  endMeasure('update-content')
}

const applySuggestion = (suggestion: WritingAdvice) => {
  if (!editorRef.value) return

  const selection = window.getSelection()
  if (!selection) return

  const range = selection.getRangeAt(0)
  range.deleteContents()
  range.insertNode(document.createTextNode(suggestion.content))
  
  updateContent()
}

// 生命周期
onMounted(() => {
  if (editorRef.value) {
    editorRef.value.innerHTML = props.modelValue
    
    if (props.placeholder) {
      editorRef.value.dataset.placeholder = props.placeholder
    }
  }
})

onBeforeUnmount(() => {
  // 清理工作
})
</script>

<style scoped lang="scss">
.rich-text-editor {
  border: 1px solid var(--color-border);
  border-radius: 4px;
  
  .editor-toolbar {
    padding: 0.5rem;
    border-bottom: 1px solid var(--color-border);
    display: flex;
    gap: 1rem;
    
    .format-buttons {
      display: flex;
      gap: 0.5rem;
    }
    
    .style-buttons {
      display: flex;
      gap: 1rem;
      align-items: center;
      
      .el-select {
        width: 100px;
      }
    }
  }
  
  .editor-content {
    min-height: 200px;
    padding: 1rem;
    outline: none;
    overflow-y: auto;
    
    &:empty::before {
      content: attr(data-placeholder);
      color: var(--color-text-placeholder);
    }
  }
  
  .editor-footer {
    padding: 0.5rem;
    border-top: 1px solid var(--color-border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .word-count {
      color: var(--color-text-secondary);
      font-size: 0.875rem;
    }
    
    .ai-suggestions {
      flex: 1;
      margin-left: 1rem;
      display: flex;
      gap: 0.5rem;
      align-items: center;
      overflow-x: auto;
      
      .suggestion-title {
        color: var(--color-text-secondary);
        font-size: 0.875rem;
        white-space: nowrap;
      }
      
      .suggestion-item {
        padding: 0.25rem 0.5rem;
        border: 1px solid var(--color-primary);
        border-radius: 4px;
        color: var(--color-primary);
        font-size: 0.875rem;
        white-space: nowrap;
        cursor: pointer;
        transition: all 0.2s;
        
        &:hover {
          background-color: var(--color-primary);
          color: white;
        }
      }
    }
  }
}
</style> 