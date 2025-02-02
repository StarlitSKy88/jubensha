<template>
  <div class="timeline-manager">
    <!-- 工具栏 -->
    <div class="toolbar">
      <el-button type="primary" @click="showAddEventDialog = true">
        <el-icon><Plus /></el-icon>添加事件
      </el-button>
      <el-button @click="showTimelineAnalysis">
        <el-icon><DataAnalysis /></el-icon>分析时间线
      </el-button>
      <el-button @click="checkConsistency">
        <el-icon><Check /></el-icon>检查一致性
      </el-button>
      <el-button @click="optimizePacing">
        <el-icon><Magic /></el-icon>优化节奏
      </el-button>
      <el-button-group>
        <el-button @click="exportTimeline">导出</el-button>
        <el-button @click="showImportDialog = true">导入</el-button>
      </el-button-group>
    </div>

    <!-- 过滤器 -->
    <div class="filters">
      <el-input
        v-model="searchQuery"
        placeholder="搜索事件..."
        class="search-input"
        clearable
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-select v-model="selectedType" placeholder="事件类型" clearable>
        <el-option
          v-for="type in eventTypes"
          :key="type.value"
          :label="type.label"
          :value="type.value"
        />
      </el-select>
      <el-select v-model="selectedImportance" placeholder="重要性" clearable>
        <el-option
          v-for="level in importanceLevels"
          :key="level.value"
          :label="level.label"
          :value="level.value"
        />
      </el-select>
    </div>

    <!-- 时间线视图 -->
    <div class="timeline-view">
      <el-timeline>
        <el-timeline-item
          v-for="event in filteredEvents"
          :key="event.id"
          :timestamp="event.date"
          :type="getEventTypeStyle(event.type)"
        >
          <div class="timeline-event">
            <h4>{{ event.title }}</h4>
            <p>{{ event.description }}</p>
            <div class="event-meta">
              <el-tag size="small">{{ event.location }}</el-tag>
              <el-tag
                v-for="character in event.characters"
                :key="character"
                size="small"
                type="info"
              >
                {{ character }}
              </el-tag>
            </div>
            <div class="event-actions">
              <el-button-group>
                <el-button
                  size="small"
                  @click="editEvent(event)"
                >编辑</el-button>
                <el-button
                  size="small"
                  type="danger"
                  @click="deleteEvent(event)"
                >删除</el-button>
              </el-button-group>
            </div>
          </div>
        </el-timeline-item>
      </el-timeline>
    </div>

    <!-- 添加/编辑事件对话框 -->
    <el-dialog
      v-model="showAddEventDialog"
      :title="editingEvent ? '编辑事件' : '添加事件'"
      width="50%"
    >
      <el-form :model="eventForm" label-width="100px">
        <el-form-item label="标题" required>
          <el-input v-model="eventForm.title" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="eventForm.description"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
        <el-form-item label="日期" required>
          <el-date-picker
            v-model="eventForm.date"
            type="datetime"
            placeholder="选择日期和时间"
          />
        </el-form-item>
        <el-form-item label="地点">
          <el-input v-model="eventForm.location" />
        </el-form-item>
        <el-form-item label="相关角色">
          <el-select
            v-model="eventForm.characters"
            multiple
            filterable
            allow-create
            placeholder="选择或添加角色"
          >
            <el-option
              v-for="character in characters"
              :key="character"
              :label="character"
              :value="character"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="重要性">
          <el-rate v-model="eventForm.importance" :max="5" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddEventDialog = false">取消</el-button>
          <el-button type="primary" @click="saveEvent">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 导入对话框 -->
    <el-dialog v-model="showImportDialog" title="导入时间线" width="30%">
      <el-upload
        class="upload-demo"
        drag
        action="#"
        :auto-upload="false"
        :on-change="handleFileChange"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          拖拽文件到此处或 <em>点击上传</em>
        </div>
      </el-upload>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showImportDialog = false">取消</el-button>
          <el-button type="primary" @click="importTimeline">导入</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 分析结果对话框 -->
    <el-dialog
      v-model="showAnalysisDialog"
      title="时间线分析"
      width="60%"
    >
      <div v-if="analysisResult">
        <h3>结构分析</h3>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="事件总数">
            {{ analysisResult.totalEvents }}
          </el-descriptions-item>
          <el-descriptions-item label="主要事件">
            {{ analysisResult.majorEvents }}
          </el-descriptions-item>
          <el-descriptions-item label="次要事件">
            {{ analysisResult.minorEvents }}
          </el-descriptions-item>
          <el-descriptions-item label="背景事件">
            {{ analysisResult.backgroundEvents }}
          </el-descriptions-item>
        </el-descriptions>

        <h3 class="mt-4">节奏分析</h3>
        <el-timeline>
          <el-timeline-item
            v-for="phase in analysisResult.phases"
            :key="phase.name"
            :type="phase.type"
          >
            <h4>{{ phase.name }}</h4>
            <p>{{ phase.description }}</p>
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-dialog>

    <!-- 一致性检查对话框 -->
    <el-dialog
      v-model="showConsistencyDialog"
      title="一致性检查"
      width="50%"
    >
      <div v-if="consistencyResult">
        <el-alert
          v-if="consistencyResult.issues.length === 0"
          type="success"
          show-icon
          :closable="false"
        >
          没有发现一致性问题
        </el-alert>
        <template v-else>
          <el-alert
            type="warning"
            show-icon
            :closable="false"
          >
            发现 {{ consistencyResult.issues.length }} 个一致性问题
          </el-alert>
          <el-timeline class="mt-4">
            <el-timeline-item
              v-for="issue in consistencyResult.issues"
              :key="issue.id"
              type="warning"
            >
              <h4>{{ issue.title }}</h4>
              <p>{{ issue.description }}</p>
              <el-button
                size="small"
                type="primary"
                @click="editEvent(issue.event)"
              >
                编辑相关事件
              </el-button>
            </el-timeline-item>
          </el-timeline>
        </template>
      </div>
    </el-dialog>

    <!-- 节奏优化对话框 -->
    <el-dialog
      v-model="showOptimizationDialog"
      title="节奏优化建议"
      width="50%"
    >
      <div v-if="optimizationResult">
        <el-collapse>
          <el-collapse-item
            v-for="suggestion in optimizationResult.suggestions"
            :key="suggestion.id"
            :title="suggestion.title"
          >
            <p>{{ suggestion.description }}</p>
            <el-button
              v-if="suggestion.relatedEvent"
              size="small"
              type="primary"
              @click="editEvent(suggestion.relatedEvent)"
            >
              编辑相关事件
            </el-button>
          </el-collapse-item>
        </el-collapse>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Plus,
  DataAnalysis,
  Check,
  Magic,
  Search,
  UploadFilled
} from '@element-plus/icons-vue'
import type { TimelineEvent } from '@/services/timeline.service'
import {
  getTimelineEvents,
  createTimelineEvent,
  updateTimelineEvent,
  deleteTimelineEvent,
  analyzeTimeline,
  checkTimelineConsistency,
  optimizeTimelinePacing,
  exportTimeline as exportTimelineService,
  importTimeline as importTimelineService
} from '@/services/timeline.service'

// 状态
const events = ref<TimelineEvent[]>([])
const searchQuery = ref('')
const selectedType = ref('')
const selectedImportance = ref('')
const showAddEventDialog = ref(false)
const showImportDialog = ref(false)
const showAnalysisDialog = ref(false)
const showConsistencyDialog = ref(false)
const showOptimizationDialog = ref(false)
const editingEvent = ref<TimelineEvent | null>(null)
const eventForm = ref({
  title: '',
  description: '',
  date: '',
  location: '',
  characters: [],
  importance: 3,
  type: 'major'
})

// 分析结果
const analysisResult = ref(null)
const consistencyResult = ref(null)
const optimizationResult = ref(null)

// 常量
const eventTypes = [
  { label: '主要事件', value: 'major' },
  { label: '次要事件', value: 'minor' },
  { label: '背景事件', value: 'background' }
]

const importanceLevels = [
  { label: '关键', value: 5 },
  { label: '重要', value: 4 },
  { label: '普通', value: 3 },
  { label: '次要', value: 2 },
  { label: '背景', value: 1 }
]

// 模拟角色数据，实际应该从角色管理服务获取
const characters = ref([
  '主角',
  '配角A',
  '配角B',
  '反派',
  '群众1'
])

// 工具函数
const getEventTypeStyle = (type: string) => {
  switch (type) {
    case 'major':
      return 'primary'
    case 'minor':
      return 'success'
    case 'background':
      return 'info'
    default:
      return ''
  }
}

// 计算属性
const filteredEvents = computed(() => {
  return events.value.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesType = !selectedType.value || event.type === selectedType.value
    const matchesImportance = !selectedImportance.value || event.importance === selectedImportance.value
    return matchesSearch && matchesType && matchesImportance
  })
})

// 方法
const loadEvents = async () => {
  try {
    events.value = await getTimelineEvents()
  } catch (error) {
    ElMessage.error('加载时间线事件失败')
  }
}

const editEvent = (event: TimelineEvent) => {
  editingEvent.value = event
  eventForm.value = { ...event }
  showAddEventDialog.value = true
}

const saveEvent = async () => {
  try {
    if (editingEvent.value) {
      await updateTimelineEvent(editingEvent.value.id, eventForm.value)
    } else {
      await createTimelineEvent(eventForm.value)
    }
    await loadEvents()
    showAddEventDialog.value = false
    ElMessage.success('保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

const deleteEvent = async (event: TimelineEvent) => {
  try {
    await deleteTimelineEvent(event.id)
    await loadEvents()
    ElMessage.success('删除成功')
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

const showTimelineAnalysis = async () => {
  try {
    const analysis = await analyzeTimeline()
    analysisResult.value = analysis
    showAnalysisDialog.value = true
  } catch (error) {
    ElMessage.error('分析失败')
  }
}

const checkConsistency = async () => {
  try {
    const result = await checkTimelineConsistency()
    consistencyResult.value = result
    showConsistencyDialog.value = true
  } catch (error) {
    ElMessage.error('一致性检查失败')
  }
}

const optimizePacing = async () => {
  try {
    const result = await optimizeTimelinePacing()
    optimizationResult.value = result
    showOptimizationDialog.value = true
  } catch (error) {
    ElMessage.error('节奏优化失败')
  }
}

const exportTimeline = async () => {
  try {
    const data = await exportTimelineService()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `timeline-${new Date().toISOString()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

const handleFileChange = (file: File) => {
  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      const content = e.target?.result
      if (typeof content === 'string') {
        const data = JSON.parse(content)
        await importTimelineService(data)
        await loadEvents()
        showImportDialog.value = false
        ElMessage.success('导入成功')
      }
    } catch (error) {
      ElMessage.error('导入失败：文件格式错误')
    }
  }
  reader.readAsText(file)
}

const importTimeline = async () => {
  try {
    // TODO: 实现导入逻辑
    showImportDialog.value = false
    ElMessage.success('导入成功')
  } catch (error) {
    ElMessage.error('导入失败')
  }
}

// 初始化
loadEvents()
</script>

<style scoped>
.timeline-manager {
  padding: 20px;
}

.toolbar {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.filters {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.search-input {
  width: 300px;
}

.timeline-view {
  margin-top: 20px;
}

.timeline-event {
  padding: 10px;
  border-radius: 4px;
  background-color: var(--el-bg-color);
}

.event-meta {
  margin-top: 10px;
  display: flex;
  gap: 5px;
}

.event-actions {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.mt-4 {
  margin-top: 1rem;
}
</style>

