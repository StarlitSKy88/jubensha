<template>
  <div class="performance-report">
    <div class="report-header">
      <h2>性能报告</h2>
      <div class="report-time">
        生成时间：{{ formatTime(report.timestamp) }}
      </div>
      <div class="report-range">
        统计范围：{{ formatTime(report.timeRange.start) }} - {{ formatTime(report.timeRange.end) }}
      </div>
    </div>

    <!-- 性能摘要 -->
    <div class="report-section">
      <h3>性能摘要</h3>
      <el-row :gutter="20">
        <el-col :span="8" v-for="(summary, type) in report.summary.metrics" :key="type">
          <el-card class="metric-summary">
            <template #header>
              <div class="metric-header">
                {{ formatMetricName(type) }}
              </div>
            </template>
            <div class="metric-stats">
              <div class="stat-item">
                <span class="label">平均值</span>
                <span class="value">{{ formatValue(summary.average) }}</span>
              </div>
              <div class="stat-item">
                <span class="label">最大值</span>
                <span class="value">{{ formatValue(summary.max) }}</span>
              </div>
              <div class="stat-item">
                <span class="label">95分位</span>
                <span class="value">{{ formatValue(summary.p95) }}</span>
              </div>
              <div class="stat-item">
                <span class="label">样本数</span>
                <span class="value">{{ summary.count }}</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 告警统计 -->
    <div class="report-section">
      <h3>告警统计</h3>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-card class="alert-summary">
            <div class="alert-stats">
              <div class="stat-total">
                总计: {{ report.summary.alerts.total }}
              </div>
              <div class="stat-detail warning">
                警告: {{ report.summary.alerts.warning }}
              </div>
              <div class="stat-detail error">
                错误: {{ report.summary.alerts.error }}
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="16">
          <el-card class="recent-alerts">
            <template #header>
              <div class="card-header">
                最近告警
              </div>
            </template>
            <el-table :data="report.details.recentAlerts" style="width: 100%">
              <el-table-column prop="timestamp" label="时间" width="180">
                <template #default="scope">
                  {{ formatTime(scope.row.timestamp) }}
                </template>
              </el-table-column>
              <el-table-column prop="level" label="级别" width="100">
                <template #default="scope">
                  <el-tag :type="scope.row.level === 'error' ? 'danger' : 'warning'">
                    {{ scope.row.level }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="message" label="消息" />
            </el-table>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 阈值违反 -->
    <div class="report-section">
      <h3>阈值违反</h3>
      <el-table :data="report.details.thresholdViolations" style="width: 100%">
        <el-table-column prop="metric" label="指标" width="200">
          <template #default="scope">
            {{ formatMetricName(scope.row.metric) }}
          </template>
        </el-table-column>
        <el-table-column prop="count" label="次数" width="100" />
        <el-table-column prop="maxValue" label="最大值" width="150">
          <template #default="scope">
            {{ formatValue(scope.row.maxValue) }}
          </template>
        </el-table-column>
        <el-table-column prop="timestamp" label="最后发生时间">
          <template #default="scope">
            {{ formatTime(scope.row.timestamp) }}
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 优化建议 -->
    <div class="report-section">
      <h3>优化建议</h3>
      <div class="recommendations">
        <el-timeline>
          <el-timeline-item
            v-for="(item, index) in report.recommendations"
            :key="index"
            :type="getRecommendationType(item.type)"
            :color="getRecommendationColor(item.type)"
          >
            <h4>{{ item.message }}</h4>
            <p v-if="item.metric">相关指标: {{ formatMetricName(item.metric) }}</p>
            <p>{{ item.suggestion }}</p>
          </el-timeline-item>
        </el-timeline>
      </div>
    </div>

    <!-- 资源使用 -->
    <div class="report-section">
      <h3>资源使用</h3>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card class="resource-card">
            <template #header>
              <div class="card-header">
                内存使用
              </div>
            </template>
            <div class="resource-stats">
              <el-progress
                type="dashboard"
                :percentage="getResourcePercentage(report.summary.resources.memory)"
                :color="getResourceColor"
              />
              <div class="resource-details">
                <div class="stat-item">
                  <span class="label">平均使用</span>
                  <span class="value">{{ formatBytes(report.summary.resources.memory.average) }}</span>
                </div>
                <div class="stat-item">
                  <span class="label">峰值使用</span>
                  <span class="value">{{ formatBytes(report.summary.resources.memory.max) }}</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="resource-card">
            <template #header>
              <div class="card-header">
                CPU使用率
              </div>
            </template>
            <div class="resource-stats">
              <el-progress
                type="dashboard"
                :percentage="getResourcePercentage(report.summary.resources.cpu)"
                :color="getResourceColor"
              />
              <div class="resource-details">
                <div class="stat-item">
                  <span class="label">平均使用</span>
                  <span class="value">{{ report.summary.resources.cpu.average.toFixed(1) }}%</span>
                </div>
                <div class="stat-item">
                  <span class="label">峰值使用</span>
                  <span class="value">{{ report.summary.resources.cpu.max.toFixed(1) }}%</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PerformanceReport } from '@/services/report.service'

const props = defineProps<{
  report: PerformanceReport
}>()

// 格式化函数
function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString()
}

function formatMetricName(key: string): string {
  const names: Record<string, string> = {
    'frontend.loadTime': '加载时间',
    'frontend.renderTime': '渲染时间',
    'frontend.scriptTime': '脚本执行',
    'resources.memory': '内存使用',
    'resources.cpu': 'CPU使用率'
  }
  return names[key] || key
}

function formatValue(value: number): string {
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

// 建议相关函数
function getRecommendationType(type: string): string {
  switch (type) {
    case 'critical':
      return 'danger'
    case 'warning':
      return 'warning'
    default:
      return 'info'
  }
}

function getRecommendationColor(type: string): string {
  switch (type) {
    case 'critical':
      return '#F56C6C'
    case 'warning':
      return '#E6A23C'
    default:
      return '#909399'
  }
}

// 资源相关函数
function getResourcePercentage(resource: { average: number; max: number }): number {
  return Math.round(resource.average)
}

const getResourceColor = computed(() => {
  return (percentage: number) => {
    if (percentage > 80) return '#F56C6C'
    if (percentage > 60) return '#E6A23C'
    return '#67C23A'
  }
})
</script>

<style scoped>
.performance-report {
  padding: 20px;
}

.report-header {
  margin-bottom: 30px;
}

.report-time,
.report-range {
  color: #909399;
  font-size: 14px;
  margin-top: 5px;
}

.report-section {
  margin-bottom: 30px;
}

.report-section h3 {
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #EBEEF5;
}

.metric-summary {
  margin-bottom: 20px;
}

.metric-header {
  font-weight: bold;
}

.metric-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-item .label {
  color: #909399;
  font-size: 12px;
  margin-bottom: 5px;
}

.stat-item .value {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.alert-summary {
  text-align: center;
  padding: 20px;
}

.stat-total {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 15px;
}

.stat-detail {
  font-size: 16px;
  margin-bottom: 10px;
}

.stat-detail.warning {
  color: #E6A23C;
}

.stat-detail.error {
  color: #F56C6C;
}

.recommendations {
  padding: 20px;
  background: #F5F7FA;
  border-radius: 4px;
}

.resource-card {
  height: 100%;
}

.resource-stats {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.resource-details {
  margin-top: 20px;
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

:deep(.el-card__header) {
  padding: 15px 20px;
  font-weight: bold;
}

:deep(.el-timeline-item__node) {
  width: 12px;
  height: 12px;
}

:deep(.el-timeline-item__content) {
  margin-left: 25px;
}
</style> 