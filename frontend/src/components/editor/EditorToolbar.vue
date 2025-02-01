<template>
  <div class="editor-toolbar">
    <el-button-group>
      <el-tooltip content="格式化剧本 (Ctrl+Shift+F)" placement="bottom">
        <el-button :icon="Magic" @click="handleFormat">格式化</el-button>
      </el-tooltip>
      <el-tooltip content="撤销 (Ctrl+Z)" placement="bottom">
        <el-button :icon="Back" @click="handleUndo" :disabled="!canUndo">撤销</el-button>
      </el-tooltip>
      <el-tooltip content="重做 (Ctrl+Y)" placement="bottom">
        <el-button :icon="Right" @click="handleRedo" :disabled="!canRedo">重做</el-button>
      </el-tooltip>
    </el-button-group>

    <el-button-group>
      <el-tooltip content="添加场景 (Ctrl+B)" placement="bottom">
        <el-button :icon="Position" @click="handleAddScene">场景</el-button>
      </el-tooltip>
      <el-tooltip content="添加角色 (Ctrl+R)" placement="bottom">
        <el-button :icon="User" @click="handleAddCharacter">角色</el-button>
      </el-tooltip>
      <el-tooltip content="添加对话 (Ctrl+D)" placement="bottom">
        <el-button :icon="ChatDotRound" @click="handleAddDialog">对话</el-button>
      </el-tooltip>
      <el-tooltip content="添加动作 (Ctrl+A)" placement="bottom">
        <el-button :icon="VideoPlay" @click="handleAddAction">动作</el-button>
      </el-tooltip>
      <el-tooltip content="添加转场 (Ctrl+T)" placement="bottom">
        <el-button :icon="SwitchButton" @click="handleAddTransition">转场</el-button>
      </el-tooltip>
    </el-button-group>

    <el-button-group>
      <el-tooltip content="AI助手 (Ctrl+Space)" placement="bottom">
        <el-button :icon="Cpu" @click="handleAIHelp" :loading="aiLoading">AI助手</el-button>
      </el-tooltip>
      <el-tooltip content="导出剧本" placement="bottom">
        <el-button :icon="Download" @click="handleExport">导出</el-button>
      </el-tooltip>
    </el-button-group>

    <el-dropdown trigger="click" @command="handleFormatConfig">
      <el-button :icon="Setting">
        格式设置
      </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="indent">缩进设置</el-dropdown-item>
          <el-dropdown-item command="case">大小写设置</el-dropdown-item>
          <el-dropdown-item command="width">宽度设置</el-dropdown-item>
          <el-dropdown-item command="spacing">行距设置</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <!-- 格式设置对话框 -->
    <el-dialog
      v-model="formatDialogVisible"
      :title="formatDialogTitle"
      width="400px"
    >
      <component
        :is="formatDialogComponent"
        v-if="formatDialogVisible"
        v-model="formatConfig"
        @confirm="handleFormatConfigConfirm"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Magic,
  Back,
  Right,
  Position,
  User,
  ChatDotRound,
  VideoPlay,
  SwitchButton,
  Cpu,
  Download,
  Setting
} from '@element-plus/icons-vue'
import type { FormatConfig } from '@/utils/scriptFormatter'

const props = defineProps<{
  canUndo: boolean
  canRedo: boolean
  aiLoading: boolean
  formatConfig: FormatConfig
}>()

const emit = defineEmits<{
  (e: 'format'): void
  (e: 'undo'): void
  (e: 'redo'): void
  (e: 'add-scene'): void
  (e: 'add-character'): void
  (e: 'add-dialog'): void
  (e: 'add-action'): void
  (e: 'add-transition'): void
  (e: 'ai-help'): void
  (e: 'export'): void
  (e: 'update:formatConfig', config: FormatConfig): void
}>()

const formatDialogVisible = ref(false)
const formatDialogType = ref<'indent' | 'case' | 'width' | 'spacing'>('indent')
const formatConfig = ref(props.formatConfig)

// 计算属性
const formatDialogTitle = computed(() => {
  switch (formatDialogType.value) {
    case 'indent':
      return '缩进设置'
    case 'case':
      return '大小写设置'
    case 'width':
      return '宽度设置'
    case 'spacing':
      return '行距设置'
  }
})

const formatDialogComponent = computed(() => {
  switch (formatDialogType.value) {
    case 'indent':
      return 'IndentConfig'
    case 'case':
      return 'CaseConfig'
    case 'width':
      return 'WidthConfig'
    case 'spacing':
      return 'SpacingConfig'
  }
})

// 事件处理
function handleFormat() {
  emit('format')
}

function handleUndo() {
  emit('undo')
}

function handleRedo() {
  emit('redo')
}

function handleAddScene() {
  emit('add-scene')
}

function handleAddCharacter() {
  emit('add-character')
}

function handleAddDialog() {
  emit('add-dialog')
}

function handleAddAction() {
  emit('add-action')
}

function handleAddTransition() {
  emit('add-transition')
}

function handleAIHelp() {
  emit('ai-help')
}

function handleExport() {
  emit('export')
}

function handleFormatConfig(type: 'indent' | 'case' | 'width' | 'spacing') {
  formatDialogType.value = type
  formatDialogVisible.value = true
}

function handleFormatConfigConfirm() {
  emit('update:formatConfig', formatConfig.value)
  formatDialogVisible.value = false
}
</script>

<style scoped lang="scss">
.editor-toolbar {
  padding: 10px;
  border-bottom: 1px solid #dcdfe6;
  display: flex;
  gap: 10px;
  align-items: center;
  
  .el-button-group {
    margin-right: 10px;
  }
  
  .el-button {
    .el-icon {
      margin-right: 4px;
    }
  }
}
</style> 