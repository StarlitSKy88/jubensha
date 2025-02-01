<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <!-- 性能概览 -->
      <el-col :span="24">
        <el-card class="overview-card">
          <template #header>
            <div class="card-header">
              <span>系统性能概览</span>
              <el-button text>刷新</el-button>
            </div>
          </template>
          <performance-overview :metrics="performanceMetrics" />
        </el-card>
      </el-col>

      <!-- 文件处理状态 -->
      <el-col :span="12">
        <el-card class="status-card">
          <template #header>
            <div class="card-header">
              <span>文件处理状态</span>
              <el-tag v-if="activeUploads > 0" type="success">{{ activeUploads }} 个任务进行中</el-tag>
            </div>
          </template>
          <file-status-chart :data="fileStatusData" />
        </el-card>
      </el-col>

      <!-- 系统资源使用 -->
      <el-col :span="12">
        <el-card class="resource-card">
          <template #header>
            <div class="card-header">
              <span>系统资源使用</span>
              <el-tag>实时</el-tag>
            </div>
          </template>
          <resource-usage-chart :data="resourceUsageData" />
        </el-card>
      </el-col>

      <!-- AI 模型性能 -->
      <el-col :span="12">
        <el-card class="ai-card">
          <template #header>
            <div class="card-header">
              <span>AI 模型性能</span>
              <el-select v-model="selectedModel" size="small">
                <el-option label="DeepSeek" value="deepseek" />
                <el-option label="其他模型" value="other" />
              </el-select>
            </div>
          </template>
          <model-performance-chart :data="modelPerformanceData" />
        </el-card>
      </el-col>

      <!-- 错误追踪 -->
      <el-col :span="12">
        <el-card class="error-card">
          <template #header>
            <div class="card-header">
              <span>错误追踪</span>
              <el-button-group>
                <el-button size="small" type="primary">24h</el-button>
                <el-button size="small">7d</el-button>
                <el-button size="small">30d</el-button>
              </el-button-group>
            </div>
          </template>
          <error-tracking-chart :data="errorTrackingData" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePerformanceStore } from '@/stores/performance'
import { useFileStore } from '@/stores/file'
import { useModelStore } from '@/stores/model'
import PerformanceOverview from './charts/PerformanceOverview.vue'
import FileStatusChart from './charts/FileStatusChart.vue'
import ResourceUsageChart from './charts/ResourceUsageChart.vue'
import ModelPerformanceChart from './charts/ModelPerformanceChart.vue'
import ErrorTrackingChart from './charts/ErrorTrackingChart.vue'

// 性能指标
const performanceStore = usePerformanceStore()
const performanceMetrics = ref({
  fileProcessingSpeed: 0,
  apiResponseTime: 0,
  memoryUsage: 0,
  cpuUsage: 0
})

// 文件状态
const fileStore = useFileStore()
const activeUploads = ref(0)
const fileStatusData = ref({
  processed: 0,
  processing: 0,
  failed: 0,
  queued: 0
})

// 系统资源
const resourceUsageData = ref({
  memory: [],
  cpu: [],
  network: []
})

// AI 模型
const modelStore = useModelStore()
const selectedModel = ref('deepseek')
const modelPerformanceData = ref({
  requestCount: 0,
  averageLatency: 0,
  errorRate: 0,
  tokenUsage: 0
})

// 错误追踪
const errorTrackingData = ref({
  errors: [],
  categories: {},
  trends: []
})

// 初始化数据
onMounted(async () => {
  // 获取性能指标
  performanceMetrics.value = await performanceStore.getMetrics()
  
  // 获取文件状态
  const fileStats = await fileStore.getStats()
  fileStatusData.value = fileStats
  activeUploads.value = fileStats.processing
  
  // 获取系统资源使用情况
  resourceUsageData.value = await performanceStore.getResourceUsage()
  
  // 获取模型性能数据
  modelPerformanceData.value = await modelStore.getPerformanceData(selectedModel.value)
  
  // 获取错误追踪数据
  errorTrackingData.value = await performanceStore.getErrorStats()
  
  // 启动实时更新
  startRealtimeUpdates()
})

// 实时更新
const startRealtimeUpdates = () => {
  setInterval(async () => {
    resourceUsageData.value = await performanceStore.getResourceUsage()
    if (activeUploads.value > 0) {
      const fileStats = await fileStore.getStats()
      fileStatusData.value = fileStats
      activeUploads.value = fileStats.processing
    }
  }, 5000)
}
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.overview-card {
  margin-bottom: 20px;
}

.status-card,
.resource-card,
.ai-card,
.error-card {
  height: 400px;
  margin-bottom: 20px;
}
</style> 