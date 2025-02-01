<template>
  <div
    class="editor-line"
    :class="{ 'is-active': isActive }"
    @click="$emit('click')"
  >
    <div class="line-number">{{ lineNumber }}</div>
    <div class="line-content">
      <template v-if="isEditing">
        <el-input
          ref="inputRef"
          v-model="editingContent"
          @blur="handleBlur"
          @keydown.enter.prevent="handleEnter"
          @keydown.esc="handleEsc"
        />
      </template>
      <template v-else>
        <div
          class="content-text"
          @dblclick="startEditing"
        >{{ line.content }}</div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { usePerformanceMonitor } from '@/utils/performance'

// Props
interface Props {
  line: {
    id: string
    content: string
  }
  lineNumber: number
  isActive: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'click'): void
  (e: 'update', content: string): void
}>()

// 性能监控
const { startMeasure, endMeasure } = usePerformanceMonitor('editor-line')

// 编辑状态
const isEditing = ref(false)
const editingContent = ref('')
const inputRef = ref<HTMLInputElement>()

// 开始编辑
const startEditing = async () => {
  startMeasure('start-editing')
  
  isEditing.value = true
  editingContent.value = props.line.content
  
  await nextTick()
  inputRef.value?.focus()
  
  endMeasure('start-editing')
}

// 结束编辑
const finishEditing = () => {
  startMeasure('finish-editing')
  
  isEditing.value = false
  if (editingContent.value !== props.line.content) {
    emit('update', editingContent.value)
  }
  
  endMeasure('finish-editing')
}

// 处理失焦
const handleBlur = () => {
  finishEditing()
}

// 处理回车
const handleEnter = () => {
  finishEditing()
}

// 处理ESC
const handleEsc = () => {
  isEditing.value = false
  editingContent.value = props.line.content
}
</script>

<style scoped lang="scss">
.editor-line {
  display: flex;
  align-items: stretch;
  min-height: 24px;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f5f7fa;
  }
  
  &.is-active {
    background-color: #ecf5ff;
  }
  
  .line-number {
    width: 40px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #909399;
    font-size: 12px;
    user-select: none;
    background-color: #fafafa;
    border-right: 1px solid #f0f0f0;
  }
  
  .line-content {
    flex: 1;
    min-width: 0;
    padding: 0 8px;
    
    .content-text {
      padding: 4px 0;
      white-space: pre-wrap;
      word-break: break-all;
      font-family: 'Fira Code', monospace;
    }
    
    :deep(.el-input__inner) {
      height: 24px;
      line-height: 24px;
      padding: 0;
      border: none;
      border-radius: 0;
      font-family: 'Fira Code', monospace;
      
      &:focus {
        box-shadow: none;
      }
    }
  }
}
</style> 