<template>
  <div class="editor-container">
    <div class="editor-main">
      <editor-toolbar 
        :format-config="formatConfig"
        @format="handleFormat"
        @undo="handleUndo"
        @redo="handleRedo"
        @add-scene="handleAddScene"
        @add-character="handleAddCharacter"
        @add-dialog="handleAddDialog"
        @add-action="handleAddAction"
        @add-transition="handleAddTransition"
        @ai-help="handleAIHelp"
        @export="handleExport"
      />
      
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

    <!-- 快捷键帮助对话框 -->
    <shortcut-help-dialog
      v-model:visible="showShortcuts"
      :shortcuts="keyboardManager.getShortcuts()"
      :keyboard-manager="keyboardManager"
      @shortcut-change="handleShortcutChange"
    />

    <!-- 格式化配置对话框 -->
    <format-config
      v-model:visible="formatConfigVisible"
      :type="formatConfigType"
      v-model="formatConfig[formatConfigType]"
      @confirm="handleFormatConfigConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import EditorToolbar from './EditorToolbar.vue'
import VirtualScroll from './VirtualScroll.vue'
import EditorLine from './EditorLine.vue'
import PerformanceMonitor from './PerformanceMonitor.vue'
import ShortcutHelpDialog from './ShortcutHelpDialog.vue'
import { usePerformanceMonitor } from '@/utils/performance'
import { KeyboardManager, defaultEditorShortcuts } from '@/utils/keyboardManager'
import { useAutoSave } from '@/composables/useAutoSave'
import { useEditorStore } from '@/stores/editor'
import { useFormatConfig } from '@/composables/useFormatConfig'

// 编辑器状态
const editorStore = useEditorStore()
const virtualScroll = ref<InstanceType<typeof VirtualScroll>>()
const activeLineIndex = ref(0)
const showPerformanceMonitor = ref(true)
const showShortcuts = ref(false)

// 性能监控
const { startMeasure, endMeasure } = usePerformanceMonitor('editor')

// 编辑器配置
const lineHeight = 24
const lines = computed(() => editorStore.lines)

// 格式化配置
const { config: formatConfig, updateConfig: updateFormatConfig } = useFormatConfig()

// 格式化配置对话框
const formatConfigVisible = ref(false)
const formatConfigType = ref<'indent' | 'case' | 'width' | 'spacing'>('indent')

// 自动保存
const { triggerSave } = useAutoSave({
  save: async () => {
    await editorStore.saveContent()
  },
  interval: 30000,
  delay: 1000
})

// 快捷键管理器
const keyboardManager = new KeyboardManager()

// 初始化快捷键
const initShortcuts = () => {
  const actions = {
    '格式化剧本': handleFormat,
    '撤销': handleUndo,
    '重做': handleRedo,
    '添加场景': handleAddScene,
    '添加角色': handleAddCharacter,
    '添加对话': handleAddDialog,
    '添加动作': handleAddAction,
    '添加转场': handleAddTransition,
    'AI助手': handleAIHelp
  }

  defaultEditorShortcuts.forEach(shortcut => {
    const action = actions[shortcut.description]
    if (action) {
      shortcut.action = action
      keyboardManager.addShortcut(shortcut)
    }
  })

  // 添加显示快捷键帮助的快捷键
  keyboardManager.addShortcut({
    id: 'help',
    key: '?',
    ctrl: true,
    description: '显示快捷键帮助',
    category: '帮助',
    isDefault: true,
    action: () => showShortcuts.value = true
  })
}

// 处理行点击
const handleLineClick = (index: number) => {
  startMeasure('line-click')
  activeLineIndex.value = index
  endMeasure('line-click')
}

// 编辑操作
const handleFormat = () => {
  startMeasure('format')
  editorStore.formatContent(formatConfig.value)
  endMeasure('format')
}

const handleUndo = () => {
  startMeasure('undo')
  editorStore.undo()
  endMeasure('undo')
}

const handleRedo = () => {
  startMeasure('redo')
  editorStore.redo()
  endMeasure('redo')
}

const handleAddScene = () => {
  startMeasure('add-scene')
  editorStore.addScene()
  endMeasure('add-scene')
}

const handleAddCharacter = () => {
  startMeasure('add-character')
  editorStore.addCharacter()
  endMeasure('add-character')
}

const handleAddDialog = () => {
  startMeasure('add-dialog')
  editorStore.addDialog()
  endMeasure('add-dialog')
}

const handleAddAction = () => {
  startMeasure('add-action')
  editorStore.addAction()
  endMeasure('add-action')
}

const handleAddTransition = () => {
  startMeasure('add-transition')
  editorStore.addTransition()
  endMeasure('add-transition')
}

const handleAIHelp = () => {
  startMeasure('ai-help')
  editorStore.showAIHelp()
  endMeasure('ai-help')
}

const handleExport = () => {
  startMeasure('export')
  editorStore.showExportDialog()
  endMeasure('export')
}

// 快捷键变更
const handleShortcutChange = () => {
  // 重新绑定快捷键事件
  document.removeEventListener('keydown', keyboardManager.handleKeyDown)
  document.addEventListener('keydown', keyboardManager.handleKeyDown)
}

// 处理格式化配置
const handleFormatConfig = (type: 'indent' | 'case' | 'width' | 'spacing') => {
  formatConfigType.value = type
  formatConfigVisible.value = true
}

// 处理格式化配置确认
const handleFormatConfigConfirm = () => {
  editorStore.formatContent(formatConfig.value)
}

// 生命周期
onMounted(() => {
  startMeasure('editor-init')
  
  // 初始化快捷键
  initShortcuts()
  
  // 绑定快捷键事件
  document.addEventListener('keydown', keyboardManager.handleKeyDown)
  
  // 加载编辑器内容
  editorStore.loadContent()
  
  // 设置初始行
  if (lines.value.length > 0) {
    activeLineIndex.value = 0
  }
  
  endMeasure('editor-init')
})

onBeforeUnmount(() => {
  // 移除快捷键事件
  document.removeEventListener('keydown', keyboardManager.handleKeyDown)
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