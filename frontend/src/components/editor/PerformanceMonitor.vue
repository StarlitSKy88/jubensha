<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { usePerformanceMonitor } from '@/utils/performance'

const props = defineProps<{
  interval?: number
  warningThreshold?: number
  errorThreshold?: number
}>()

const emit = defineEmits<{
  (e: 'warning', metric: string, value: number): void
  (e: 'error', metric: string, value: number): void
}>()

// 性能指标
const metrics = ref({
  fps: 0,
  memory: {
    used: 0,
    total: 0,
    limit: 0
  },
  timing: {
    loadTime: 0,
    renderTime: 0,
    scriptTime: 0
  },
  operations: {
    editorUpdate: 0,
    scrollUpdate: 0,
    stateUpdate: 0
  }
})

// 帧率监控
let lastTime = performance.now()
let frames = 0

const calculateFPS = () => {
  const now = performance.now()
  frames++
  
  if (now > lastTime + 1000) {
    metrics.value.fps = Math.round((frames * 1000) / (now - lastTime))
    frames = 0
    lastTime = now
  }
  
  requestAnimationFrame(calculateFPS)
}

// 内存监控
const monitorMemory = () => {
  if (performance.memory) {
    metrics.value.memory = {
      used: performance.memory.usedJSHeapSize,
      total: performance.memory.totalJSHeapSize,
      limit: performance.memory.jsHeapSizeLimit
    }
    
    // 检查内存使用率
    const memoryUsage = metrics.value.memory.used / metrics.value.memory.total
    if (memoryUsage > props.errorThreshold!) {
      emit('error', 'memory', memoryUsage)
    } else if (memoryUsage > props.warningThreshold!) {
      emit('warning', 'memory', memoryUsage)
    }
  }
}

// 性能监控
const { startMeasure, endMeasure, getMetrics } = usePerformanceMonitor()

// 更新性能指标
const updateMetrics = () => {
  const performanceMetrics = getMetrics()
  
  metrics.value.timing = {
    loadTime: performanceMetrics.loadTime || 0,
    renderTime: performanceMetrics.renderTime || 0,
    scriptTime: performanceMetrics.scriptTime || 0
  }
  
  metrics.value.operations = {
    editorUpdate: performanceMetrics.editorUpdate || 0,
    scrollUpdate: performanceMetrics.scrollUpdate || 0,
    stateUpdate: performanceMetrics.stateUpdate || 0
  }
  
  // 检查性能指标
  Object.entries(metrics.value.timing).forEach(([key, value]) => {
    if (value > props.errorThreshold!) {
      emit('error', key, value)
    } else if (value > props.warningThreshold!) {
      emit('warning', key, value)
    }
  })
}

// 生命周期钩子
onMounted(() => {
  // 启动帧率监控
  requestAnimationFrame(calculateFPS)
  
  // 启动内存监控
  const memoryInterval = setInterval(monitorMemory, props.interval || 5000)
  
  // 启动性能监控
  const metricsInterval = setInterval(updateMetrics, props.interval || 5000)
  
  onUnmounted(() => {
    clearInterval(memoryInterval)
    clearInterval(metricsInterval)
  })
})
</script>

<template>
  <div class="performance-monitor" data-test="performance-monitor">
    <!-- FPS指标 -->
    <div class="metric-group">
      <h3>帧率</h3>
      <div class="metric" :class="{ warning: metrics.fps < 50, error: metrics.fps < 30 }">
        {{ metrics.fps }} FPS
      </div>
    </div>
    
    <!-- 内存指标 -->
    <div class="metric-group">
      <h3>内存使用</h3>
      <div class="metric">
        已用: {{ (metrics.memory.used / 1024 / 1024).toFixed(1) }}MB
      </div>
      <div class="metric">
        总计: {{ (metrics.memory.total / 1024 / 1024).toFixed(1) }}MB
      </div>
      <div class="metric">
        限制: {{ (metrics.memory.limit / 1024 / 1024).toFixed(1) }}MB
      </div>
    </div>
    
    <!-- 时间指标 -->
    <div class="metric-group">
      <h3>响应时间</h3>
      <div class="metric" :class="{ warning: metrics.timing.loadTime > 1000, error: metrics.timing.loadTime > 3000 }">
        加载: {{ metrics.timing.loadTime.toFixed(1) }}ms
      </div>
      <div class="metric" :class="{ warning: metrics.timing.renderTime > 16, error: metrics.timing.renderTime > 33 }">
        渲染: {{ metrics.timing.renderTime.toFixed(1) }}ms
      </div>
      <div class="metric" :class="{ warning: metrics.timing.scriptTime > 100, error: metrics.timing.scriptTime > 300 }">
        脚本: {{ metrics.timing.scriptTime.toFixed(1) }}ms
      </div>
    </div>
    
    <!-- 操作指标 -->
    <div class="metric-group">
      <h3>操作响应</h3>
      <div class="metric" :class="{ warning: metrics.operations.editorUpdate > 50, error: metrics.operations.editorUpdate > 100 }">
        编辑: {{ metrics.operations.editorUpdate.toFixed(1) }}ms
      </div>
      <div class="metric" :class="{ warning: metrics.operations.scrollUpdate > 16, error: metrics.operations.scrollUpdate > 33 }">
        滚动: {{ metrics.operations.scrollUpdate.toFixed(1) }}ms
      </div>
      <div class="metric" :class="{ warning: metrics.operations.stateUpdate > 50, error: metrics.operations.stateUpdate > 100 }">
        状态: {{ metrics.operations.stateUpdate.toFixed(1) }}ms
      </div>
    </div>
  </div>
</template>

<style scoped>
.performance-monitor {
  position: fixed;
  right: 20px;
  top: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 15px;
  border-radius: 8px;
  font-family: monospace;
  z-index: 9999;
  min-width: 200px;
}

.metric-group {
  margin-bottom: 15px;
}

.metric-group h3 {
  margin: 0 0 5px;
  font-size: 14px;
  color: #aaa;
}

.metric {
  font-size: 12px;
  margin: 3px 0;
  padding: 2px 5px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.1);
}

.metric.warning {
  background: rgba(255, 165, 0, 0.3);
  color: #ffa500;
}

.metric.error {
  background: rgba(255, 0, 0, 0.3);
  color: #ff4444;
}
</style> 