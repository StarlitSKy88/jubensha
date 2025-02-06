<template>
  <div class="timeline-view">
    <div class="toolbar">
      <el-button-group>
        <el-button type="primary" @click="addEvent">
          <el-icon><Plus /></el-icon>
          添加事件
        </el-button>
        <el-button @click="previewTimeline">
          <el-icon><View /></el-icon>
          预览
        </el-button>
      </el-button-group>
      <div class="filter-group">
        <el-select
          v-model="selectedCharacters"
          multiple
          collapse-tags
          placeholder="按角色筛选"
          class="filter-select"
        >
          <el-option
            v-for="char in characters"
            :key="char.id"
            :label="char.name"
            :value="char.id"
          />
        </el-select>
        <el-select
          v-model="selectedEventTypes"
          multiple
          collapse-tags
          placeholder="按事件类型筛选"
          class="filter-select"
        >
          <el-option
            v-for="type in eventTypes"
            :key="type.value"
            :label="type.label"
            :value="type.value"
          />
        </el-select>
      </div>
    </div>

    <div class="timeline-content">
      <div class="timeline-header">
        <div class="time-axis">
          <div
            v-for="hour in timeRange"
            :key="hour"
            class="time-marker"
          >
            {{ formatHour(hour) }}
          </div>
        </div>
      </div>

      <div class="timeline-body">
        <div class="character-lanes">
          <div
            v-for="char in filteredCharacters"
            :key="char.id"
            class="character-lane"
          >
            <div class="lane-header">
              <el-avatar :size="32" :src="char.avatar">
                {{ char.name.charAt(0) }}
              </el-avatar>
              <span class="character-name">{{ char.name }}</span>
            </div>
            <div class="lane-content">
              <div
                v-for="event in getCharacterEvents(char.id)"
                :key="event.id"
                class="event-item"
                :class="event.type"
                :style="getEventStyle(event)"
                @click="editEvent(event)"
              >
                <div class="event-content">
                  <span class="event-time">{{ formatTime(event.time) }}</span>
                  <span class="event-title">{{ event.title }}</span>
                  <el-tag
                    v-if="event.type"
                    size="small"
                    :type="getEventTypeTag(event.type)"
                  >
                    {{ getEventTypeLabel(event.type) }}
                  </el-tag>
                </div>
                <div
                  v-if="event.description"
                  class="event-description"
                >
                  {{ event.description }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 事件编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="60%"
    >
      <el-form
        ref="eventFormRef"
        :model="eventForm"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="事件标题" prop="title">
          <el-input v-model="eventForm.title" />
        </el-form-item>

        <el-form-item label="事件类型" prop="type">
          <el-select v-model="eventForm.type">
            <el-option
              v-for="type in eventTypes"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="发生时间" prop="time">
          <el-time-picker
            v-model="eventForm.time"
            format="HH:mm"
            placeholder="选择时间"
          />
        </el-form-item>

        <el-form-item label="持续时间" prop="duration">
          <el-input-number
            v-model="eventForm.duration"
            :min="5"
            :max="120"
            :step="5"
          />
          <span class="unit-text">分钟</span>
        </el-form-item>

        <el-form-item label="相关角色" prop="characters">
          <el-select
            v-model="eventForm.characters"
            multiple
            filterable
          >
            <el-option
              v-for="char in characters"
              :key="char.id"
              :label="char.name"
              :value="char.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="事件描述" prop="description">
          <el-input
            v-model="eventForm.description"
            type="textarea"
            :rows="4"
          />
        </el-form-item>

        <el-form-item label="关联线索" prop="clues">
          <el-select
            v-model="eventForm.clues"
            multiple
            filterable
            allow-create
          >
            <el-option
              v-for="clue in clues"
              :key="clue.id"
              :label="clue.name"
              :value="clue.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="重要程度" prop="importance">
          <el-rate
            v-model="eventForm.importance"
            :max="3"
            :texts="['普通', '重要', '关键']"
            show-text
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveEvent">
            保存
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 预览对话框 -->
    <el-dialog
      v-model="previewDialogVisible"
      title="时间线预览"
      width="80%"
      fullscreen
    >
      <div class="timeline-preview">
        <el-timeline>
          <el-timeline-item
            v-for="event in sortedEvents"
            :key="event.id"
            :timestamp="formatTime(event.time)"
            :type="getEventTimelineType(event)"
          >
            <h4>{{ event.title }}</h4>
            <p class="event-meta">
              <el-tag
                size="small"
                :type="getEventTypeTag(event.type)"
              >
                {{ getEventTypeLabel(event.type) }}
              </el-tag>
              <span class="event-characters">
                参与角色：{{ getCharacterNames(event.characters) }}
              </span>
            </p>
            <p v-if="event.description" class="event-description">
              {{ event.description }}
            </p>
            <div v-if="event.clues?.length" class="event-clues">
              <p>相关线索：</p>
              <el-tag
                v-for="clue in event.clues"
                :key="clue"
                size="small"
                class="clue-tag"
              >
                {{ getClueLabel(clue) }}
              </el-tag>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, View } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const props = defineProps<{
  scriptId: string
}>()

// 状态
const dialogVisible = ref(false)
const previewDialogVisible = ref(false)
const eventFormRef = ref<FormInstance>()
const selectedCharacters = ref<string[]>([])
const selectedEventTypes = ref<string[]>([])

// 表单数据
const eventForm = ref({
  id: '',
  title: '',
  type: '',
  time: null,
  duration: 30,
  characters: [],
  description: '',
  clues: [],
  importance: 1
})

// 事件类型
const eventTypes = [
  { label: '对话', value: 'dialogue' },
  { label: '行动', value: 'action' },
  { label: '发现', value: 'discovery' },
  { label: '剧情', value: 'plot' }
]

// 时间轴配置
const timeRange = Array.from({ length: 25 }, (_, i) => i)

// 模拟数据
const characters = ref([
  { id: '1', name: '张三', avatar: '' },
  { id: '2', name: '李四', avatar: '' }
])

const events = ref([
  {
    id: '1',
    title: '发现尸体',
    type: 'discovery',
    time: '20:30',
    duration: 30,
    characters: ['1', '2'],
    description: '在别墅二楼的书房发现被害人尸体',
    clues: ['1'],
    importance: 3
  }
])

const clues = ref([
  { id: '1', name: '染血的信' },
  { id: '2', name: '神秘钥匙' }
])

// 计算属性
const dialogTitle = computed(() => {
  return eventForm.value.id ? '编辑事件' : '新建事件'
})

const filteredCharacters = computed(() => {
  if (selectedCharacters.value.length === 0) {
    return characters.value
  }
  return characters.value.filter(char => 
    selectedCharacters.value.includes(char.id)
  )
})

const filteredEvents = computed(() => {
  let result = events.value
  
  if (selectedCharacters.value.length > 0) {
    result = result.filter(event =>
      event.characters.some(id => selectedCharacters.value.includes(id))
    )
  }
  
  if (selectedEventTypes.value.length > 0) {
    result = result.filter(event =>
      selectedEventTypes.value.includes(event.type)
    )
  }
  
  return result
})

const sortedEvents = computed(() => {
  return [...filteredEvents.value].sort((a, b) => {
    return a.time.localeCompare(b.time)
  })
})

// 方法
const formatHour = (hour: number) => {
  return `${hour.toString().padStart(2, '0')}:00`
}

const formatTime = (time: string) => {
  return time || '--'
}

const getEventTypeLabel = (type: string) => {
  return eventTypes.find(t => t.value === type)?.label || type
}

const getEventTypeTag = (type: string) => {
  const typeMap: Record<string, string> = {
    dialogue: '',
    action: 'success',
    discovery: 'warning',
    plot: 'danger'
  }
  return typeMap[type] || ''
}

const getEventTimelineType = (event: any) => {
  const typeMap: Record<string, string> = {
    dialogue: 'info',
    action: 'success',
    discovery: 'warning',
    plot: 'danger'
  }
  return typeMap[event.type] || 'info'
}

const getCharacterNames = (characterIds: string[]) => {
  return characterIds
    .map(id => characters.value.find(c => c.id === id)?.name)
    .filter(Boolean)
    .join('、') || '无'
}

const getClueLabel = (clueId: string) => {
  return clues.value.find(c => c.id === clueId)?.name || clueId
}

const getCharacterEvents = (characterId: string) => {
  return filteredEvents.value.filter(event =>
    event.characters.includes(characterId)
  )
}

const getEventStyle = (event: any) => {
  const startHour = parseInt(event.time.split(':')[0])
  const startMinute = parseInt(event.time.split(':')[1])
  const left = `${(startHour * 60 + startMinute) / (24 * 60) * 100}%`
  const width = `${event.duration / (24 * 60) * 100}%`
  
  return {
    left,
    width,
    zIndex: event.importance
  }
}

const addEvent = () => {
  eventForm.value = {
    id: '',
    title: '',
    type: '',
    time: null,
    duration: 30,
    characters: [],
    description: '',
    clues: [],
    importance: 1
  }
  dialogVisible.value = true
}

const editEvent = (event: any) => {
  eventForm.value = { ...event }
  dialogVisible.value = true
}

const saveEvent = async () => {
  if (!eventFormRef.value) return

  await eventFormRef.value.validate(async (valid, fields) => {
    if (valid) {
      // TODO: 保存事件
      dialogVisible.value = false
    }
  })
}

const previewTimeline = () => {
  previewDialogVisible.value = true
}

// 表单验证规则
const formRules = ref<FormRules>({
  title: [
    { required: true, message: '请输入事件标题', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择事件类型', trigger: 'change' }
  ],
  time: [
    { required: true, message: '请选择发生时间', trigger: 'change' }
  ],
  characters: [
    { required: true, message: '请选择相关角色', trigger: 'change' }
  ]
})
</script>

<style scoped>
.timeline-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.toolbar {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #dcdfe6;
}

.filter-group {
  display: flex;
  gap: 16px;
}

.filter-select {
  width: 200px;
}

.timeline-content {
  flex: 1;
  overflow: auto;
  padding: 20px;
}

.timeline-header {
  position: sticky;
  top: 0;
  background: #fff;
  z-index: 10;
  padding-bottom: 16px;
}

.time-axis {
  display: flex;
  position: relative;
  margin-left: 200px;
  border-bottom: 1px solid #dcdfe6;
}

.time-marker {
  flex: 1;
  text-align: center;
  padding: 8px;
  font-size: 12px;
  color: #909399;
  border-left: 1px solid #dcdfe6;
}

.character-lanes {
  position: relative;
}

.character-lane {
  display: flex;
  margin-bottom: 16px;
  min-height: 80px;
}

.lane-header {
  width: 200px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f5f7fa;
  border-right: 1px solid #dcdfe6;
}

.character-name {
  font-weight: 500;
}

.lane-content {
  flex: 1;
  position: relative;
  padding: 8px 0;
}

.event-item {
  position: absolute;
  top: 8px;
  height: calc(100% - 16px);
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.event-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
}

.event-item.dialogue {
  background-color: #ecf5ff;
  border-color: #d9ecff;
}

.event-item.action {
  background-color: #f0f9eb;
  border-color: #e1f3d8;
}

.event-item.discovery {
  background-color: #fdf6ec;
  border-color: #faecd8;
}

.event-item.plot {
  background-color: #fef0f0;
  border-color: #fde2e2;
}

.event-content {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.event-time {
  font-size: 12px;
  color: #909399;
}

.event-title {
  font-weight: 500;
  flex: 1;
}

.event-description {
  font-size: 12px;
  color: #606266;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.timeline-preview {
  padding: 20px;
}

.event-meta {
  margin: 8px 0;
  display: flex;
  align-items: center;
  gap: 16px;
}

.event-characters {
  font-size: 14px;
  color: #606266;
}

.event-clues {
  margin-top: 8px;
}

.clue-tag {
  margin-right: 8px;
  margin-bottom: 8px;
}

.unit-text {
  margin-left: 8px;
  color: #606266;
}
</style> 