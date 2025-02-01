<template>
  <div class="performance-dashboard">
    <!-- 实时指标面板 -->
    <div class="metrics-panel">
      <h3>实时性能指标</h3>
      <div class="metrics-grid">
        <div 
          v-for="(value, key) in metrics" 
          :key="key"
          class="metric-card"
          :class="getMetricClass(key, value)"
        >
          <div class="metric-name">{{ formatMetricName(key) }}</div>
          <div class="metric-value">{{ formatMetricValue(value) }}</div>
          <div class="metric-trend">
            <trend-chart
              :data="getTrendData(key)"
              :gradient="['#6ec6ff']"
              :min="0"
              :max="getMetricMax(key)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 告警信息面板 -->
    <div class="alerts-panel">
      <h3>告警信息</h3>
      <div class="alerts-list">
        <div 
          v-for="alert in recentAlerts" 
          :key="alert.timestamp"
          class="alert-item"
          :class="alert.level"
        >
          <div class="alert-header">
            <span class="alert-time">{{ formatTime(alert.timestamp) }}</span>
            <span class="alert-level">{{ alert.level }}</span>
          </div>
          <div class="alert-message">{{ alert.message }}</div>
          <div class="alert-metric">
            {{ formatMetricValue(alert.metric.value) }}
          </div>
        </div>
      </div>
    </div>

    <!-- 历史趋势图表 -->
    <div class="trends-panel">
      <h3>性能趋势</h3>
      <div class="chart-controls">
        <el-select v-model="selectedMetric" placeholder="选择指标">
          <el-option
            v-for="metric in availableMetrics"
            :key="metric.value"
            :label="metric.label"
            :value="metric.value"
          />
        </el-select>
        <el-select v-model="timeRange" placeholder="时间范围">
          <el-option label="最近1小时" value="1h" />
          <el-option label="最近24小时" value="24h" />
          <el-option label="最近7天" value="7d" />
        </el-select>
      </div>
      <div class="trend-chart">
        <line-chart
          :data="chartData"
          :options="chartOptions"
        />
      </div>
    </div>

    <!-- 系统资源监控 -->
    <div class="resources-panel">
      <h3>系统资源</h3>
      <div class="resources-grid">
        <div class="resource-card">
          <div class="resource-title">内存使用</div>
          <el-progress
            type="dashboard"
            :percentage="memoryUsage"
            :color="getResourceColor(memoryUsage)"
          />
          <div class="resource-detail">
            {{ formatBytes(memoryMetrics.used) }} / {{ formatBytes(memoryMetrics.total) }}
          </div>
        </div>
        <div class="resource-card">
          <div class="resource-title">CPU使用率</div>
          <el-progress
            type="dashboard"
            :percentage="cpuUsage"
            :color="getResourceColor(cpuUsage)"
          />
          <div class="resource-detail">{{ cpuUsage }}%</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { usePerformanceMonitor } from '@/utils/performance'
import { performanceStorage } from '@/services/performance.service'
import { PERFORMANCE_CONFIG } from '@/utils/performance'
import { TrendChart, LineChart } from 'vue-trend-chart'
import type { PerformanceAlert, PerformanceMetric } from '@/utils/performance'

// 性能指标数据
const metrics = ref<Record<string, number>>({})
const recentAlerts = ref<PerformanceAlert[]>([])
const selectedMetric = ref('frontend.loadTime')
const timeRange = ref('1h')

// 系统资源指标
const memoryMetrics = ref({
  used: 0,
  total: 0,
  limit: 0
})
const cpuUsage = ref(0)

// 计算属性
const memoryUsage = computed(() => {
  return Math.round((memoryMetrics.value.used / memoryMetrics.value.total) * 100)
})

const availableMetrics = computed(() => [
  { label: '加载时间', value: 'frontend.loadTime' },
  { label: '渲染时间', value: 'frontend.renderTime' },
  { label: '脚本执行', value: 'frontend.scriptTime' },
  { label: '内存使用', value: 'resources.memory' },
  { label: 'CPU使用率', value: 'resources.cpu' }
])

// 图表配置
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true
    }
  }
}

// 趋势数据
const trendData = ref<Record<string, number[]>>({})
const chartData = computed(() => {
  const data = trendData.value[selectedMetric.value] || []
  return {
    labels: data.map((_, index) => `${index + 1}分钟前`),
    datasets: [{
      label: formatMetricName(selectedMetric.value),
      data,
      borderColor: '#409EFF',
      backgroundColor: 'rgba(64, 158, 255, 0.1)',
      borderWidth: 2,
      fill: true
    }]
  }
})

// 初始化数据
onMounted(async () => {
  // 加载历史数据
  await loadHistoricalData()
  
  // 启动实时更新
  startRealTimeUpdates()
})

onUnmounted(() => {
  stopRealTimeUpdates()
})

// 加载历史数据
async function loadHistoricalData() {
  const endTime = Date.now()
  const startTime = getStartTime()
  
  const [metrics, alerts] = await Promise.all([
    performanceStorage.getMetrics({
      startTime,
      endTime
    }),
    performanceStorage.getAlerts({
      startTime,
      endTime
    })
  ])
  
  updateMetricsData(metrics)
  updateAlertsData(alerts)
}

// 实时更新
let updateInterval: number
function startRealTimeUpdates() {
  updateInterval = window.setInterval(async () => {
    const monitor = usePerformanceMonitor()
    const currentMetrics = monitor.getMetrics()
    
    // 更新指标数据
    metrics.value = currentMetrics
    
    // 更新趋势数据
    Object.entries(currentMetrics).forEach(([key, value]) => {
      if (!trendData.value[key]) {
        trendData.value[key] = []
      }
      trendData.value[key].push(value)
      // 保留最近60个数据点
      if (trendData.value[key].length > 60) {
        trendData.value[key].shift()
      }
    })
    
    // 更新系统资源指标
    if (performance.memory) {
      memoryMetrics.value = {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      }
    }
    
    // 获取最新告警
    const newAlerts = await performanceStorage.getAlerts({
      startTime: Date.now() - 5 * 60 * 1000 // 最近5分钟
    })
    recentAlerts.value = newAlerts
  }, 1000)
}

function stopRealTimeUpdates() {
  if (updateInterval) {
    clearInterval(updateInterval)
  }
}

// 辅助函数
function getStartTime(): number {
  const now = Date.now()
  switch (timeRange.value) {
    case '1h':
      return now - 60 * 60 * 1000
    case '24h':
      return now - 24 * 60 * 60 * 1000
    case '7d':
      return now - 7 * 24 * 60 * 60 * 1000
    default:
      return now - 60 * 60 * 1000
  }
}

function formatMetricName(key: string): string {
  const names: Record<string, string> = {
    loadTime: '加载时间',
    renderTime: '渲染时间',
    scriptTime: '脚本执行',
    editorUpdate: '编辑器更新',
    scrollUpdate: '滚动更新',
    stateUpdate: '状态更新'
  }
  return names[key] || key
}

function formatMetricValue(value: number): string {
  if (value > 1000) {
    return `${(value / 1000).toFixed(2)}s`
  }
  return `${value.toFixed(2)}ms`
}

function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB']
  let value = bytes
  let unitIndex = 0
  
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex++
  }
  
  return `${value.toFixed(2)} ${units[unitIndex]}`
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString()
}

function getMetricClass(key: string, value: number): string[] {
  const classes = ['metric']
  const thresholds = PERFORMANCE_CONFIG.frontend[key]
  
  if (!thresholds) return classes
  
  if (value > thresholds.error) {
    classes.push('error')
  } else if (value > thresholds.warning) {
    classes.push('warning')
  }
  
  return classes
}

function getResourceColor(percentage: number): string {
  if (percentage > 80) return '#F56C6C'
  if (percentage > 60) return '#E6A23C'
  return '#67C23A'
}

function getTrendData(key: string): number[] {
  return trendData.value[key] || []
}

function getMetricMax(key: string): number {
  const thresholds = PERFORMANCE_CONFIG.frontend[key]
  return thresholds ? thresholds.error * 1.2 : 100
}

function updateMetricsData(newMetrics: PerformanceMetric[]) {
  // 更新当前指标
  const latestMetrics: Record<string, number> = {}
  newMetrics.forEach(metric => {
    latestMetrics[metric.type] = metric.value
  })
  metrics.value = latestMetrics
  
  // 更新趋势数据
  updateTrendData(newMetrics)
}

function updateAlertsData(alerts: PerformanceAlert[]) {
  recentAlerts.value = alerts
}

// 更新趋势数据
function updateTrendData(metrics: PerformanceMetric[]) {
  const groupedData: Record<string, number[]> = {}
  
  metrics.forEach(metric => {
    if (!groupedData[metric.type]) {
      groupedData[metric.type] = []
    }
    groupedData[metric.type].push(metric.value)
  })
  
  // 对每个指标保留最新的60个数据点（1小时的数据）
  Object.keys(groupedData).forEach(key => {
    groupedData[key] = groupedData[key].slice(-60)
  })
  
  trendData.value = groupedData
}
</script>

<style scoped>
.performance-dashboard {
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 20px;
}

.metrics-panel,
.alerts-panel,
.trends-panel,
.resources-panel {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-top: 15px;
}

.metric-card {
  background: #f5f7fa;
  border-radius: 6px;
  padding: 15px;
  transition: all 0.3s ease;
}

.metric-card.warning {
  background: #fdf6ec;
  border: 1px solid #f5dab1;
}

.metric-card.error {
  background: #fef0f0;
  border: 1px solid #fbc4c4;
}

.metric-name {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.metric-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 8px;
}

.alerts-list {
  margin-top: 15px;
  max-height: 300px;
  overflow-y: auto;
}

.alert-item {
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 10px;
  background: #f5f7fa;
}

.alert-item.warning {
  background: #fdf6ec;
}

.alert-item.error {
  background: #fef0f0;
}

.alert-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.alert-time {
  color: #909399;
  font-size: 12px;
}

.alert-level {
  font-weight: bold;
  text-transform: uppercase;
  font-size: 12px;
}

.alert-message {
  color: #303133;
  margin-bottom: 4px;
}

.alert-metric {
  color: #606266;
  font-size: 12px;
}

.trends-panel {
  grid-column: span 2;
}

.chart-controls {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.trend-chart {
  height: 300px;
}

.resources-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-top: 15px;
}

.resource-card {
  text-align: center;
  padding: 15px;
}

.resource-title {
  margin-bottom: 15px;
  color: #606266;
}

.resource-detail {
  margin-top: 10px;
  color: #909399;
  font-size: 14px;
}
</style> 