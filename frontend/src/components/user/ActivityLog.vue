<template>
  <div class="activity-log">
    <el-timeline>
      <el-timeline-item
        v-for="activity in activities"
        :key="activity.id"
        :timestamp="formatTime(activity.timestamp)"
        :type="getActivityType(activity.type) as 'primary' | 'success' | 'warning' | 'info' | undefined"
      >
        <h4>{{ activity.title }}</h4>
        <p>{{ activity.description }}</p>
        <template v-if="activity.metadata">
          <el-collapse>
            <el-collapse-item title="详细信息">
              <pre>{{ JSON.stringify(activity.metadata, null, 2) }}</pre>
            </el-collapse-item>
          </el-collapse>
        </template>
      </el-timeline-item>
    </el-timeline>

    <div v-if="loading" class="loading">
      <el-skeleton :rows="3" animated />
    </div>

    <div v-if="!loading && activities.length === 0" class="empty">
      <el-empty description="暂无操作记录" />
    </div>

    <div v-if="hasMore" class="load-more">
      <el-button :loading="loading" @click="loadMore">加载更多</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'

interface Activity {
  id: string
  type: 'login' | 'profile_update' | 'password_change' | 'settings_update' | 'other'
  title: string
  description: string
  timestamp: string
  metadata?: Record<string, any>
}

type TimelineType = 'primary' | 'success' | 'warning' | 'info' | undefined

const activities = ref<Activity[]>([])
const loading = ref(false)
const hasMore = ref(true)
const page = ref(1)
const pageSize = 10

const formatTime = (timestamp: string) => {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')
}

const getActivityType = (type: Activity['type']): TimelineType => {
  const types: Record<Activity['type'], TimelineType> = {
    login: 'primary',
    profile_update: 'success',
    password_change: 'warning',
    settings_update: 'info',
    other: undefined
  }
  return types[type]
}

const loadActivities = async () => {
  if (loading.value) return

  loading.value = true
  try {
    const response = await fetch(`/api/user/activities?page=${page.value}&pageSize=${pageSize}`)
    if (!response.ok) throw new Error('加载失败')

    const data = await response.json()
    activities.value.push(...data.items)
    hasMore.value = data.items.length === pageSize
    page.value++
  } catch (error) {
    ElMessage.error('加载操作记录失败：' + (error instanceof Error ? error.message : '未知错误'))
  } finally {
    loading.value = false
  }
}

const loadMore = () => {
  loadActivities()
}

onMounted(() => {
  loadActivities()
})
</script>

<style scoped>
.activity-log {
  padding: 20px;
}

.loading {
  padding: 20px 0;
}

.empty {
  padding: 40px 0;
  text-align: center;
}

.load-more {
  text-align: center;
  margin-top: 20px;
}

pre {
  background-color: var(--el-bg-color-page);
  padding: 10px;
  border-radius: 4px;
  font-size: 12px;
  overflow-x: auto;
}
</style> 