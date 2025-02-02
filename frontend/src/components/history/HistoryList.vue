<template>
  <div class="history-list">
    <!-- 工具栏 -->
    <div class="toolbar">
      <el-button-group>
        <el-button 
          type="primary" 
          :icon="RefreshRight"
          @click="loadHistory"
        >
          刷新
        </el-button>
        <el-button 
          type="danger" 
          :icon="Delete"
          @click="handleClearHistory"
        >
          清空历史
        </el-button>
      </el-button-group>

      <el-radio-group v-model="timeRange" @change="handleTimeRangeChange">
        <el-radio-button label="today">今天</el-radio-button>
        <el-radio-button label="week">本周</el-radio-button>
        <el-radio-button label="month">本月</el-radio-button>
        <el-radio-button label="all">全部</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 历史记录列表 -->
    <el-timeline>
      <el-timeline-item
        v-for="item in historyList"
        :key="item.id"
        :timestamp="formatDate(item.createdAt)"
        :type="getTimelineItemType(item.type)"
      >
        <el-card class="history-card">
          <template #header>
            <div class="card-header">
              <span class="title">{{ item.title }}</span>
              <el-tag :type="getTagType(item.type)" size="small">
                {{ getActionText(item.type) }}
              </el-tag>
            </div>
          </template>
          
          <div class="card-content">
            <p class="description">{{ item.description }}</p>
            <div class="meta">
              <span class="project">
                <el-icon><Folder /></el-icon>
                {{ item.projectName }}
              </span>
              <span class="file">
                <el-icon><Document /></el-icon>
                {{ item.fileName }}
              </span>
            </div>
          </div>

          <div class="actions">
            <el-button 
              type="primary" 
              link 
              :icon="View"
              @click="handleView(item)"
            >
              查看
            </el-button>
            <el-button 
              type="success" 
              link 
              :icon="RefreshLeft"
              @click="handleRestore(item)"
            >
              恢复
            </el-button>
            <el-button 
              type="danger" 
              link 
              :icon="Delete"
              @click="handleDelete(item)"
            >
              删除
            </el-button>
          </div>
        </el-card>
      </el-timeline-item>
    </el-timeline>

    <!-- 加载更多 -->
    <div v-if="hasMore" class="load-more">
      <el-button 
        :loading="loading" 
        @click="loadMore"
      >
        加载更多
      </el-button>
    </div>

    <!-- 预览对话框 -->
    <el-dialog
      v-model="previewVisible"
      title="历史记录详情"
      width="800px"
    >
      <div class="preview-content">
        <div class="diff-view" v-html="diffContent"></div>
      </div>
    </el-dialog>

    <!-- 确认对话框 -->
    <el-dialog
      v-model="confirmVisible"
      :title="confirmTitle"
      width="300px"
    >
      <p>{{ confirmMessage }}</p>
      <template #footer>
        <el-button @click="confirmVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { 
  RefreshRight, 
  RefreshLeft, 
  Delete, 
  View, 
  Folder, 
  Document 
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formatDate, getRelativeTime } from '@/utils/date'
import { diffLines } from 'diff'
import type { HistoryRecord } from '@/types/history'

// 状态
const historyList = ref<HistoryRecord[]>([])
const timeRange = ref('today')
const loading = ref(false)
const hasMore = ref(true)
const page = ref(1)
const pageSize = ref(20)

// 对话框状态
const previewVisible = ref(false)
const confirmVisible = ref(false)
const confirmTitle = ref('')
const confirmMessage = ref('')
const confirmCallback = ref<() => void>()
const diffContent = ref('')

// 加载历史记录
const loadHistory = async (reset = true) => {
  if (reset) {
    page.value = 1
    historyList.value = []
  }
  
  loading.value = true
  try {
    const { items, total } = await getHistoryList({
      page: page.value,
      pageSize: pageSize.value,
      timeRange: timeRange.value
    })
    
    if (reset) {
      historyList.value = items
    } else {
      historyList.value.push(...items)
    }
    
    hasMore.value = historyList.value.length < total
  } catch (error) {
    ElMessage.error('加载历史记录失败')
  }
  loading.value = false
}

// 加载更多
const loadMore = () => {
  page.value++
  loadHistory(false)
}

// 时间范围变更
const handleTimeRangeChange = () => {
  loadHistory()
}

// 清空历史
const handleClearHistory = () => {
  confirmTitle.value = '清空历史'
  confirmMessage.value = '确定要清空所有历史记录吗？此操作不可恢复。'
  confirmCallback.value = async () => {
    try {
      await clearHistory()
      ElMessage.success('清空历史记录成功')
      loadHistory()
    } catch (error) {
      ElMessage.error('清空历史记录失败')
    }
    confirmVisible.value = false
  }
  confirmVisible.value = true
}

// 查看历史记录
const handleView = async (item: HistoryRecord) => {
  try {
    const { oldContent, newContent } = await getHistoryDetail(item.id)
    const diff = diffLines(oldContent, newContent)
    diffContent.value = formatDiff(diff)
    previewVisible.value = true
  } catch (error) {
    ElMessage.error('加载历史记录详情失败')
  }
}

// 恢复历史记录
const handleRestore = (item: HistoryRecord) => {
  confirmTitle.value = '恢复历史'
  confirmMessage.value = '确定要恢复到此版本吗？当前未保存的内容将会丢失。'
  confirmCallback.value = async () => {
    try {
      await restoreHistory(item.id)
      ElMessage.success('恢复历史记录成功')
      confirmVisible.value = false
    } catch (error) {
      ElMessage.error('恢复历史记录失败')
    }
  }
  confirmVisible.value = true
}

// 删除历史记录
const handleDelete = (item: HistoryRecord) => {
  confirmTitle.value = '删除历史'
  confirmMessage.value = '确定要删除此历史记录吗？此操作不可恢复。'
  confirmCallback.value = async () => {
    try {
      await deleteHistory(item.id)
      ElMessage.success('删除历史记录成功')
      loadHistory()
    } catch (error) {
      ElMessage.error('删除历史记录失败')
    }
    confirmVisible.value = false
  }
  confirmVisible.value = true
}

// 确认操作
const handleConfirm = () => {
  confirmCallback.value?.()
}

// 工具函数
const getTimelineItemType = (type: string): '' | 'primary' | 'success' | 'warning' | 'danger' => {
  const typeMap: Record<string, '' | 'primary' | 'success' | 'warning' | 'danger'> = {
    create: 'primary',
    update: 'success',
    delete: 'danger',
    restore: 'warning'
  }
  return typeMap[type] || ''
}

const getTagType = (type: string): '' | 'success' | 'warning' | 'danger' => {
  const typeMap: Record<string, '' | 'success' | 'warning' | 'danger'> = {
    create: '',
    update: 'success',
    delete: 'danger',
    restore: 'warning'
  }
  return typeMap[type] || ''
}

const getActionText = (type: string): string => {
  const textMap: Record<string, string> = {
    create: '创建',
    update: '更新',
    delete: '删除',
    restore: '恢复'
  }
  return textMap[type] || type
}

const formatDiff = (diff: any[]): string => {
  return diff.map(part => {
    const color = part.added ? 'green' : part.removed ? 'red' : 'grey'
    const text = part.value.replace(/\n/g, '<br>')
    return `<span style="color: ${color}">${text}</span>`
  }).join('')
}

// 初始化
onMounted(() => {
  loadHistory()
})
</script>

<style scoped lang="scss">
.history-list {
  padding: 20px;

  .toolbar {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  .history-card {
    margin-bottom: 10px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .title {
        font-weight: bold;
      }
    }

    .card-content {
      .description {
        margin: 10px 0;
        color: #666;
      }

      .meta {
        display: flex;
        gap: 20px;
        color: #999;
        font-size: 12px;

        .project,
        .file {
          display: flex;
          align-items: center;
          gap: 4px;
        }
      }
    }

    .actions {
      margin-top: 10px;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }
  }

  .load-more {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }

  .preview-content {
    max-height: 500px;
    overflow-y: auto;

    .diff-view {
      font-family: monospace;
      white-space: pre-wrap;
      line-height: 1.5;
    }
  }
}
</style> 