<template>
  <el-dialog
    title="版本历史"
    :visible="visible"
    width="800px"
    @close="handleClose"
  >
    <div class="version-history">
      <div class="version-list">
        <div
          v-for="version in versions"
          :key="version.id"
          class="version-item"
          :class="{ active: selectedVersion?.id === version.id }"
          @click="handleVersionSelect(version)"
        >
          <div class="version-header">
            <div class="version-time">
              {{ formatTime(version.timestamp) }}
            </div>
            <div class="version-author">
              {{ version.author }}
            </div>
          </div>
          <div class="version-description">
            {{ version.description }}
          </div>
          <div class="version-changes">
            <div
              v-for="(change, index) in version.changes"
              :key="index"
              class="change-item"
            >
              <el-tag
                :type="getChangeType(change.type)"
                size="small"
              >
                {{ getChangeLabel(change.type) }}
              </el-tag>
              <span class="change-path">{{ change.path }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="version-diff" v-if="selectedVersion && diffResult">
        <div class="diff-header">
          <div class="diff-title">变更详情</div>
          <div class="diff-actions">
            <el-button
              type="primary"
              size="small"
              :loading="loading"
              @click="handleRestore"
            >
              还原到此版本
            </el-button>
          </div>
        </div>

        <div class="diff-content">
          <div
            v-for="(change, index) in diffResult.changes"
            :key="index"
            class="diff-line"
            :class="getDiffLineClass(change.type)"
          >
            <div class="line-number">{{ change.line }}</div>
            <div class="line-content">
              <span class="line-prefix">{{ getDiffLinePrefix(change.type) }}</span>
              {{ change.content }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Version, VersionDiff } from '@/services/version/version.service'
import { usePerformanceMonitor } from '@/utils/performance'

const props = defineProps<{
  visible: boolean
  versions: Version[]
  currentVersion: Version | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'restore', version: Version): void
}>()

// 性能监控
const { startMeasure, endMeasure } = usePerformanceMonitor()

// 状态
const loading = ref(false)
const selectedVersion = ref<Version | null>(null)
const diffResult = ref<VersionDiff | null>(null)

// 方法
const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleString()
}

const getChangeType = (type: 'add' | 'remove' | 'modify'): string => {
  switch (type) {
    case 'add':
      return 'success'
    case 'remove':
      return 'danger'
    case 'modify':
      return 'warning'
    default:
      return 'info'
  }
}

const getChangeLabel = (type: 'add' | 'remove' | 'modify'): string => {
  switch (type) {
    case 'add':
      return '新增'
    case 'remove':
      return '删除'
    case 'modify':
      return '修改'
    default:
      return '未知'
  }
}

const getDiffLineClass = (type: 'add' | 'remove' | 'modify'): string => {
  switch (type) {
    case 'add':
      return 'line-add'
    case 'remove':
      return 'line-remove'
    case 'modify':
      return 'line-modify'
    default:
      return ''
  }
}

const getDiffLinePrefix = (type: 'add' | 'remove' | 'modify'): string => {
  switch (type) {
    case 'add':
      return '+'
    case 'remove':
      return '-'
    case 'modify':
      return '~'
    default:
      return ' '
  }
}

const handleVersionSelect = async (version: Version) => {
  startMeasure('select-version')
  selectedVersion.value = version

  if (props.currentVersion) {
    // 计算与当前版本的差异
    diffResult.value = {
      before: props.currentVersion.content,
      after: version.content,
      changes: []
    }

    // TODO: 计算行级差异
  }

  endMeasure('select-version')
}

const handleRestore = async () => {
  if (!selectedVersion.value) return

  startMeasure('restore-version')
  loading.value = true

  try {
    emit('restore', selectedVersion.value)
    handleClose()
  } catch (error) {
    console.error('还原版本失败：', error)
  } finally {
    loading.value = false
    endMeasure('restore-version')
  }
}

const handleClose = () => {
  selectedVersion.value = null
  diffResult.value = null
  emit('update:visible', false)
}
</script>

<style scoped lang="scss">
.version-history {
  display: flex;
  gap: 1rem;
  height: 500px;
  
  .version-list {
    width: 300px;
    overflow-y: auto;
    border-right: 1px solid var(--color-border);
    
    .version-item {
      padding: 1rem;
      border-bottom: 1px solid var(--color-border);
      cursor: pointer;
      transition: all 0.2s;
      
      &:hover {
        background-color: var(--color-primary-light);
      }
      
      &.active {
        background-color: var(--color-primary-lighter);
      }
      
      .version-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
        
        .version-time {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
        }
        
        .version-author {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
        }
      }
      
      .version-description {
        margin-bottom: 0.5rem;
      }
      
      .version-changes {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        
        .change-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          
          .change-path {
            font-size: 0.875rem;
            color: var(--color-text-secondary);
          }
        }
      }
    }
  }
  
  .version-diff {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    
    .diff-header {
      padding: 1rem;
      border-bottom: 1px solid var(--color-border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .diff-title {
        font-weight: bold;
      }
    }
    
    .diff-content {
      flex: 1;
      overflow-y: auto;
      padding: 1rem;
      font-family: monospace;
      
      .diff-line {
        display: flex;
        gap: 1rem;
        
        &.line-add {
          background-color: rgba(103, 194, 58, 0.1);
        }
        
        &.line-remove {
          background-color: rgba(245, 108, 108, 0.1);
        }
        
        &.line-modify {
          background-color: rgba(230, 162, 60, 0.1);
        }
        
        .line-number {
          width: 40px;
          color: var(--color-text-secondary);
          text-align: right;
          user-select: none;
        }
        
        .line-content {
          flex: 1;
          
          .line-prefix {
            color: var(--color-text-secondary);
            margin-right: 0.5rem;
            user-select: none;
          }
        }
      }
    }
  }
}
</style> 