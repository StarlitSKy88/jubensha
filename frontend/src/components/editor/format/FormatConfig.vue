<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="500px"
  >
    <div class="format-config">
      <!-- 配置表单 -->
      <el-form :model="config" label-position="top">
        <!-- 缩进配置 -->
        <template v-if="type === 'indent'">
          <el-form-item label="场景标题缩进">
            <el-input-number
              v-model="config.sceneIndent"
              :min="0"
              :max="8"
              :step="2"
            />
            <span class="unit">个空格</span>
          </el-form-item>

          <el-form-item label="角色名称缩进">
            <el-input-number
              v-model="config.characterIndent"
              :min="0"
              :max="8"
              :step="2"
            />
            <span class="unit">个空格</span>
          </el-form-item>

          <el-form-item label="对话内容缩进">
            <el-input-number
              v-model="config.dialogIndent"
              :min="0"
              :max="8"
              :step="2"
            />
            <span class="unit">个空格</span>
          </el-form-item>

          <el-form-item label="动作描述缩进">
            <el-input-number
              v-model="config.actionIndent"
              :min="0"
              :max="8"
              :step="2"
            />
            <span class="unit">个空格</span>
          </el-form-item>
        </template>

        <!-- 大小写配置 -->
        <template v-if="type === 'case'">
          <el-form-item label="场景标题">
            <el-select v-model="config.sceneCase">
              <el-option label="全部大写" value="upper" />
              <el-option label="首字母大写" value="title" />
              <el-option label="保持原样" value="normal" />
            </el-select>
          </el-form-item>

          <el-form-item label="角色名称">
            <el-select v-model="config.characterCase">
              <el-option label="全部大写" value="upper" />
              <el-option label="首字母大写" value="title" />
              <el-option label="保持原样" value="normal" />
            </el-select>
          </el-form-item>

          <el-form-item label="转场文本">
            <el-select v-model="config.transitionCase">
              <el-option label="全部大写" value="upper" />
              <el-option label="首字母大写" value="title" />
              <el-option label="保持原样" value="normal" />
            </el-select>
          </el-form-item>
        </template>

        <!-- 宽度配置 -->
        <template v-if="type === 'width'">
          <el-form-item label="对话宽度">
            <el-input-number
              v-model="config.dialogWidth"
              :min="20"
              :max="80"
              :step="5"
            />
            <span class="unit">个字符</span>
          </el-form-item>

          <el-form-item label="动作宽度">
            <el-input-number
              v-model="config.actionWidth"
              :min="40"
              :max="100"
              :step="5"
            />
            <span class="unit">个字符</span>
          </el-form-item>
        </template>

        <!-- 行距配置 -->
        <template v-if="type === 'spacing'">
          <el-form-item label="场景间距">
            <el-input-number
              v-model="config.sceneSpacing"
              :min="1"
              :max="3"
              :step="1"
            />
            <span class="unit">行</span>
          </el-form-item>

          <el-form-item label="对话间距">
            <el-input-number
              v-model="config.dialogSpacing"
              :min="1"
              :max="3"
              :step="1"
            />
            <span class="unit">行</span>
          </el-form-item>

          <el-form-item label="动作间距">
            <el-input-number
              v-model="config.actionSpacing"
              :min="1"
              :max="3"
              :step="1"
            />
            <span class="unit">行</span>
          </el-form-item>
        </template>

        <!-- 操作按钮 -->
        <el-form-item>
          <el-button type="primary" @click="handleConfirm">确认</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 预览区域 -->
      <div class="preview">
        <h4>预览</h4>
        <pre class="preview-content" :style="previewStyle">{{ previewText }}</pre>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// 配置类型
type ConfigType = 'indent' | 'case' | 'width' | 'spacing'

// 属性定义
const props = defineProps<{
  visible: boolean
  type: ConfigType
  modelValue: Record<string, any>
}>()

// 事件定义
const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'update:modelValue', value: Record<string, any>): void
  (e: 'confirm'): void
}>()

// 对话框可见性
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

// 对话框标题
const dialogTitle = computed(() => {
  switch (props.type) {
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

// 配置数据
const config = ref({ ...props.modelValue })

// 预览样式
const previewStyle = computed(() => {
  return {
    lineHeight: props.type === 'spacing' ? config.value.dialogSpacing : 1
  }
})

// 预览文本
const previewText = computed(() => {
  switch (props.type) {
    case 'indent':
      return generateIndentPreview()
    case 'case':
      return generateCasePreview()
    case 'width':
      return generateWidthPreview()
    case 'spacing':
      return generateSpacingPreview()
    default:
      return ''
  }
})

// 生成缩进预览
function generateIndentPreview(): string {
  const { sceneIndent, characterIndent, dialogIndent, actionIndent } = config.value
  return [
    '场景标题'.padStart(sceneIndent + 4, ' '),
    '',
    '角色名称'.padStart(characterIndent + 4, ' '),
    '对话内容'.padStart(dialogIndent + 4, ' '),
    '',
    '动作描述'.padStart(actionIndent + 4, ' ')
  ].join('\n')
}

// 生成大小写预览
function generateCasePreview(): string {
  const { sceneCase, characterCase, transitionCase } = config.value
  
  const formatText = (text: string, type: string) => {
    switch (type) {
      case 'upper':
        return text.toUpperCase()
      case 'title':
        return text.replace(/\b\w/g, c => c.toUpperCase())
      default:
        return text
    }
  }

  return [
    formatText('内景 咖啡厅 - 日', sceneCase),
    '',
    formatText('张三', characterCase),
    '你好，我是张三。',
    '',
    formatText('cut to:', transitionCase)
  ].join('\n')
}

// 生成宽度预览
function generateWidthPreview(): string {
  const { dialogWidth, actionWidth } = config.value
  const longText = '这是一段很长的文本用来测试宽度限制。当文本超过设定的宽度时，会自动换行显示。'
  
  return [
    '张三',
    longText.slice(0, dialogWidth),
    '',
    longText.slice(0, actionWidth)
  ].join('\n')
}

// 生成行距预览
function generateSpacingPreview(): string {
  const { sceneSpacing, dialogSpacing, actionSpacing } = config.value
  const lines = []
  
  lines.push('场景一')
  for (let i = 0; i < sceneSpacing; i++) lines.push('')
  
  lines.push('张三')
  lines.push('对话一')
  for (let i = 0; i < dialogSpacing; i++) lines.push('')
  
  lines.push('动作描述')
  for (let i = 0; i < actionSpacing; i++) lines.push('')
  
  return lines.join('\n')
}

// 确认修改
function handleConfirm() {
  emit('update:modelValue', { ...config.value })
  emit('confirm')
  dialogVisible.value = false
}

// 重置配置
function handleReset() {
  switch (props.type) {
    case 'indent':
      config.value = {
        sceneIndent: 0,
        characterIndent: 2,
        dialogIndent: 4,
        actionIndent: 2
      }
      break
    case 'case':
      config.value = {
        sceneCase: 'upper',
        characterCase: 'upper',
        transitionCase: 'upper'
      }
      break
    case 'width':
      config.value = {
        dialogWidth: 35,
        actionWidth: 60
      }
      break
    case 'spacing':
      config.value = {
        sceneSpacing: 2,
        dialogSpacing: 1,
        actionSpacing: 1
      }
      break
  }
}
</script>

<style scoped lang="scss">
.format-config {
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