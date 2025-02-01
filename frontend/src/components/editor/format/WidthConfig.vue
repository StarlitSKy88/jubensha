<template>
  <div class="width-config">
    <el-form :model="config" label-position="top">
      <el-form-item label="对话宽度">
        <el-input-number
          v-model="config.dialogWidth"
          :min="20"
          :max="80"
          :step="5"
          controls-position="right"
        />
        <span class="unit">个字符</span>
      </el-form-item>

      <el-form-item label="动作宽度">
        <el-input-number
          v-model="config.actionWidth"
          :min="40"
          :max="100"
          :step="5"
          controls-position="right"
        />
        <span class="unit">个字符</span>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleConfirm">确认</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="preview">
      <h4>预览</h4>
      <pre class="preview-content">{{ previewText }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { FormatConfig } from '@/utils/scriptFormatter'
import { ScriptFormatter } from '@/utils/scriptFormatter'

const props = defineProps<{
  modelValue: FormatConfig
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: FormatConfig): void
  (e: 'confirm'): void
}>()

const config = ref({
  dialogWidth: props.modelValue.dialogWidth,
  actionWidth: props.modelValue.actionWidth
})

const formatter = new ScriptFormatter(config.value)

const previewText = computed(() => {
  const longDialog = '这是一段很长的对话，用来测试对话的宽度限制。当对话超过设定的宽度时，会自动换行显示。'
  const longAction = '这是一段很长的动作描写，用来测试动作描写的宽度限制。当动作描写超过设定的宽度时，会自动换行显示。场景中的人物走来走去，做着各种动作。'

  const formattedDialog = formatter.formatDialog(longDialog)
  const formattedAction = formatter.formatAction(longAction)

  return `张三\n${formattedDialog}\n\n${formattedAction}`
})

function handleConfirm() {
  emit('update:modelValue', {
    ...props.modelValue,
    dialogWidth: config.value.dialogWidth,
    actionWidth: config.value.actionWidth
  })
  emit('confirm')
}

function handleReset() {
  config.value = {
    dialogWidth: 35,
    actionWidth: 60
  }
}
</script>

<style scoped lang="scss">
.width-config {
  .unit {
    margin-left: 8px;
    color: #909399;
  }

  .preview {
    margin-top: 20px;
    
    h4 {
      margin: 0 0 10px;
      font-size: 14px;
      color: #606266;
    }
    
    .preview-content {
      padding: 10px;
      background: #f5f7fa;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 14px;
      line-height: 1.6;
      white-space: pre-wrap;
    }
  }
}
</style> 