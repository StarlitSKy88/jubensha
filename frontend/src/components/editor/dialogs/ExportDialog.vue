<template>
  <el-dialog
    title="导出剧本"
    :visible="visible"
    width="500px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="导出格式" prop="format">
        <el-radio-group v-model="form.format">
          <el-radio label="txt">文本文件 (.txt)</el-radio>
          <el-radio label="html">网页文件 (.html)</el-radio>
          <el-radio label="pdf">PDF 文件 (.pdf)</el-radio>
          <el-radio label="docx">Word 文档 (.docx)</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="导出选项">
        <el-checkbox v-model="form.includeMetadata">包含元数据</el-checkbox>
        <el-checkbox v-model="form.includeCharacters">包含角色列表</el-checkbox>
        <el-checkbox v-model="form.includeScenes">包含场景列表</el-checkbox>
        <el-checkbox v-model="form.includeClues">包含线索列表</el-checkbox>
      </el-form-item>

      <template v-if="form.format === 'html'">
        <el-form-item
          label="自定义样式"
          prop="customStyle"
        >
          <el-input
            v-model="form.customStyle"
            type="textarea"
            :rows="4"
            placeholder="请输入自定义 CSS 样式"
          />
        </el-form-item>
      </template>

      <template v-if="form.format === 'pdf' || form.format === 'docx'">
        <el-form-item label="页面设置">
          <el-select
            v-model="pageOptions.pageSize"
            style="width: 120px"
          >
            <el-option label="A4" :value="form.format === 'pdf' ? 'a4' : 'A4'" />
            <el-option label="信纸" :value="form.format === 'pdf' ? 'letter' : 'Letter'" />
          </el-select>
          <el-select
            v-model="pageOptions.orientation"
            style="width: 120px; margin-left: 10px"
          >
            <el-option label="纵向" value="portrait" />
            <el-option label="横向" value="landscape" />
          </el-select>
        </el-form-item>

        <el-form-item label="页边距">
          <el-input-number
            v-model="pageOptions.margins.top"
            :min="10"
            :max="50"
            label="上"
            style="width: 100px"
          />
          <el-input-number
            v-model="pageOptions.margins.right"
            :min="10"
            :max="50"
            label="右"
            style="width: 100px; margin-left: 10px"
          />
          <el-input-number
            v-model="pageOptions.margins.bottom"
            :min="10"
            :max="50"
            label="下"
            style="width: 100px; margin-left: 10px"
          />
          <el-input-number
            v-model="pageOptions.margins.left"
            :min="10"
            :max="50"
            label="左"
            style="width: 100px; margin-left: 10px"
          />
        </el-form-item>

        <el-form-item label="字体大小">
          <el-input-number
            v-model="pageOptions.fontSize.title"
            :min="12"
            :max="36"
            label="标题"
            style="width: 100px"
          />
          <el-input-number
            v-model="pageOptions.fontSize.heading"
            :min="10"
            :max="24"
            label="小标题"
            style="width: 100px; margin-left: 10px"
          />
          <el-input-number
            v-model="pageOptions.fontSize.body"
            :min="8"
            :max="16"
            label="正文"
            style="width: 100px; margin-left: 10px"
          />
        </el-form-item>

        <el-form-item label="页眉">
          <el-input v-model="pageOptions.header" placeholder="请输入页眉内容" />
        </el-form-item>

        <el-form-item label="页脚">
          <el-input v-model="pageOptions.footer" placeholder="请输入页脚内容" />
        </el-form-item>
      </template>
    </el-form>

    <template #footer>
      <div class="progress" v-if="loading">
        <el-progress
          :percentage="progress"
          :status="progress === 100 ? 'success' : undefined"
        />
        <div class="progress-text">{{ progressText }}</div>
      </div>
      <div v-else>
        <el-button @click="handleClose">取消</el-button>
        <el-button @click="showPreview = true">预览</el-button>
        <el-button
          type="primary"
          :loading="loading"
          @click="handleExport"
        >
          导出
        </el-button>
      </div>
    </template>

    <export-preview-dialog
      v-if="showPreview"
      v-model:visible="showPreview"
      :script="script"
      :options="form"
      @export="handleExport"
    />
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { FormInstance } from 'element-plus'
import type { Script } from '@/types/script'
import type { ExportOptions } from '@/services/export/export.service'
import { ExportService } from '@/services/export/export.service'
import { usePerformanceMonitor } from '@/utils/performance'
import ExportPreviewDialog from './ExportPreviewDialog.vue'

const props = defineProps<{
  visible: boolean
  script: Script
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
}>()

// 性能监控
const { startMeasure, endMeasure } = usePerformanceMonitor()

// 导出服务
const exportService = new ExportService()

// 表单相关
const formRef = ref<FormInstance>()
const loading = ref(false)
const progress = ref(0)
const progressText = ref('')

const form = ref<ExportOptions>({
  format: 'txt',
  includeMetadata: true,
  includeCharacters: true,
  includeScenes: true,
  includeClues: true,
  customStyle: '',
  pdfOptions: {
    pageSize: 'a4',
    orientation: 'portrait',
    margins: {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20
    },
    fontSize: {
      title: 24,
      heading: 16,
      body: 12
    },
    header: '',
    footer: ''
  }
})

const rules = {
  format: [
    { required: true, message: '请选择导出格式', trigger: 'change' }
  ]
}

// 预览功能
const showPreview = ref(false)

// 页面选项
const pageOptions = ref({
  pageSize: 'a4',
  orientation: 'portrait',
  margins: {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20
  },
  fontSize: {
    title: 24,
    heading: 16,
    body: 12
  },
  header: '',
  footer: ''
})

// 监听页面选项变化
watch(pageOptions, (newOptions) => {
  if (form.value.format === 'pdf') {
    form.value.pdfOptions = {
      ...newOptions,
      pageSize: newOptions.pageSize.toLowerCase()
    }
  } else if (form.value.format === 'docx') {
    form.value.docxOptions = {
      ...newOptions,
      pageSize: newOptions.pageSize.toUpperCase()
    }
  }
}, { deep: true })

// 监听格式变化
watch(() => form.value.format, (newFormat) => {
  if (newFormat === 'pdf') {
    pageOptions.value.pageSize = pageOptions.value.pageSize.toLowerCase()
  } else if (newFormat === 'docx') {
    pageOptions.value.pageSize = pageOptions.value.pageSize.toUpperCase()
  }
})

// 方法
const handleExport = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    
    startMeasure('export')
    loading.value = true
    progress.value = 0
    progressText.value = '正在准备导出...'

    // 更新进度
    const updateProgress = (percent: number, text: string) => {
      progress.value = percent
      progressText.value = text
    }

    // 导出文件
    updateProgress(10, '正在生成文件...')
    const blob = await exportService.exportScript(props.script, form.value)

    // 下载文件
    updateProgress(90, '正在下载文件...')
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${props.script.title}.${form.value.format}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    updateProgress(100, '导出完成')
    setTimeout(() => {
      handleClose()
    }, 500)
  } catch (error) {
    console.error('导出失败：', error)
    progressText.value = '导出失败：' + (error as Error).message
  } finally {
    loading.value = false
    endMeasure('export')
  }
}

const handleClose = () => {
  emit('update:visible', false)
}
</script>

<style scoped lang="scss">
:deep(.el-form-item__content) {
  flex-wrap: wrap;
}

.el-radio-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.el-checkbox {
  margin-right: 1rem;
}

.progress {
  width: 100%;
  
  .progress-text {
    margin-top: 0.5rem;
    text-align: center;
    color: var(--color-text-secondary);
    font-size: 0.875rem;
  }
}
</style> 