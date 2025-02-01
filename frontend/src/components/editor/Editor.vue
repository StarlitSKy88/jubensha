<template>
  <div class="editor-container">
    <div class="editor-main">
      <editor-toolbar />
      
      <div class="editor-content">
        <virtual-scroll
          ref="virtualScroll"
          :items="lines"
          :item-height="lineHeight"
          :buffer="20"
          :batch-size="50"
          :debounce-time="16"
        >
          <template #default="{ item, index }">
            <editor-line
              :line="item"
              :line-number="index + 1"
              :is-active="activeLineIndex === index"
              @click="handleLineClick(index)"
            />
          </template>
        </virtual-scroll>
      </div>
    </div>
    
    <div class="editor-sidebar">
      <performance-monitor v-if="showPerformanceMonitor" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import EditorToolbar from './EditorToolbar.vue'
import VirtualScroll from './VirtualScroll.vue'
import EditorLine from './EditorLine.vue'
import PerformanceMonitor from './PerformanceMonitor.vue'
import { usePerformanceMonitor } from '@/utils/performance'
import { useEditorStore } from '@/stores/editor'

// 编辑器状态
const editorStore = useEditorStore()
const virtualScroll = ref<InstanceType<typeof VirtualScroll>>()
const activeLineIndex = ref(0)
const showPerformanceMonitor = ref(true)

// 性能监控
const { startMeasure, endMeasure } = usePerformanceMonitor('editor')

// 编辑器配置
const lineHeight = 24
const lines = computed(() => editorStore.lines)

// 处理行点击
const handleLineClick = (index: number) => {
  startMeasure('line-click')
  activeLineIndex.value = index
  endMeasure('line-click')
}

// 初始化
onMounted(() => {
  startMeasure('editor-init')
  
  // 加载编辑器内容
  editorStore.loadContent()
  
  // 设置初始行
  if (lines.value.length > 0) {
    activeLineIndex.value = 0
  }
  
  endMeasure('editor-init')
})
</script>

<style scoped lang="scss">
.editor-container {
  display: flex;
  height: 100%;
  
  .editor-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    
    .editor-content {
      flex: 1;
      overflow: hidden;
    }
  }
  
  .editor-sidebar {
    width: 300px;
    border-left: 1px solid #dcdfe6;
    overflow-y: auto;
  }
}
</style> 