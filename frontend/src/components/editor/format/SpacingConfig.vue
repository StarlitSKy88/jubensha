<template>
  <div class="spacing-config">
    <el-form :model="config" label-position="top">
      <el-form-item label="行距">
        <el-input-number
          v-model="config.lineSpacing"
          :min="1"
          :max="3"
          :step="0.5"
          :precision="1"
          controls-position="right"
        />
        <span class="unit">倍</span>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleConfirm">确认</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="preview">
      <h4>预览</h4>
      <pre class="preview-content" :style="{ lineHeight: config.lineSpacing }">INT. 咖啡厅 - 日

张三
你好，我是张三。

李四
(微笑)
很高兴认识你。

CUT TO:

EXT. 公园 - 日

阳光明媚，树叶随风摇曳。</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { FormatConfig } from '@/utils/scriptFormatter'

const props = defineProps<{
  modelValue: FormatConfig
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: FormatConfig): void
  (e: 'confirm'): void
}>()

const config = ref({
  lineSpacing: props.modelValue.lineSpacing
})

function handleConfirm() {
  emit('update:modelValue', {
    ...props.modelValue,
    lineSpacing: config.value.lineSpacing
  })
  emit('confirm')
}

function handleReset() {
  config.value = {
    lineSpacing: 1
  }
}
</script>

<style scoped lang="scss">
.spacing-config {
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
      white-space: pre-wrap;
    }
  }
}
</style> 