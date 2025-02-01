<template>
  <div class="case-config">
    <el-form :model="config" label-position="top">
      <el-form-item label="场景标题">
        <el-select v-model="config.sceneCase" placeholder="请选择大小写格式">
          <el-option label="全部大写" value="upper" />
          <el-option label="首字母大写" value="title" />
          <el-option label="保持原样" value="normal" />
        </el-select>
      </el-form-item>

      <el-form-item label="角色名称">
        <el-select v-model="config.characterCase" placeholder="请选择大小写格式">
          <el-option label="全部大写" value="upper" />
          <el-option label="首字母大写" value="title" />
          <el-option label="保持原样" value="normal" />
        </el-select>
      </el-form-item>

      <el-form-item label="转场文本">
        <el-select v-model="config.transitionCase" placeholder="请选择大小写格式">
          <el-option label="全部大写" value="upper" />
          <el-option label="首字母大写" value="title" />
          <el-option label="保持原样" value="normal" />
        </el-select>
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
  sceneCase: props.modelValue.sceneCase,
  characterCase: props.modelValue.characterCase,
  transitionCase: props.modelValue.transitionCase
})

const formatter = new ScriptFormatter(config.value)

const previewText = computed(() => {
  const scene = formatter.formatCase('int. 咖啡厅 - 日', config.value.sceneCase)
  const character = formatter.formatCase('张三', config.value.characterCase)
  const transition = formatter.formatCase('cut to:', config.value.transitionCase)

  return `${scene}\n\n${character}\n你好，我是张三。\n\n${transition}`
})

function handleConfirm() {
  emit('update:modelValue', {
    ...props.modelValue,
    sceneCase: config.value.sceneCase,
    characterCase: config.value.characterCase,
    transitionCase: config.value.transitionCase
  })
  emit('confirm')
}

function handleReset() {
  config.value = {
    sceneCase: 'upper',
    characterCase: 'upper',
    transitionCase: 'upper'
  }
}
</script>

<style scoped lang="scss">
.case-config {
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