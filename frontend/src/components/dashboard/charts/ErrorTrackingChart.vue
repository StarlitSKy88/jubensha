<template>
  <div class="error-tracking-chart">
    <div class="chart-container">
      <div ref="trendChartRef" class="trend-chart"></div>
      <div ref="categoryChartRef" class="category-chart"></div>
    </div>
    <div class="error-list">
      <el-scrollbar height="150px">
        <div v-for="error in latestErrors" :key="error.id" class="error-item">
          <div class="error-header">
            <span class="error-type" :class="error.level">{{ error.type }}</span>
            <span class="error-time">{{ formatTime(error.time) }}</span>
          </div>
          <div class="error-message">{{ error.message }}</div>
        </div>
      </el-scrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'

interface ErrorData {
  errors: Array<{
    id: string
    type: string
    message: string
    level: 'error' | 'warning' | 'info'
    time: number
  }>
  categories: Record<string, number>
  trends: Array<{
    time: number
    count: number
  }>
}

const props = defineProps<{
  data: ErrorData
}>()

const trendChartRef = ref<HTMLElement>()
const categoryChartRef = ref<HTMLElement>()
let trendChart: echarts.ECharts | null = null
let categoryChart: echarts.ECharts | null = null

// 获取最近的错误
const latestErrors = computed(() => {
  return props.data.errors.slice(0, 5)
})

// 格式化时间
const formatTime = (timestamp: number) => {
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 趋势图配置
const getTrendChartOption = (): EChartsOption => ({
  title: {
    text: '错误趋势',
    left: 'center',
    top: 0,
    textStyle: {
      fontSize: 14
    }
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'line'
    }
  },
  xAxis: {
    type: 'time',
    axisLabel: {
      formatter: (value: number) => {
        const date = new Date(value)
        return \`\${date.getHours()}:\${date.getMinutes()}\`
      }
    }
  },
  yAxis: {
    type: 'value',
    name: '错误数',
    minInterval: 1
  },
  series: [
    {
      data: props.data.trends.map(item => [item.time, item.count]),
      type: 'line',
      smooth: true,
      areaStyle: {
        opacity: 0.1
      },
      itemStyle: {
        color: '#F56C6C'
      }
    }
  ]
})

// 分类图配置
const getCategoryChartOption = (): EChartsOption => ({
  title: {
    text: '错误分布',
    left: 'center',
    top: 0,
    textStyle: {
      fontSize: 14
    }
  },
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c} ({d}%)'
  },
  series: [
    {
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: false
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 12,
          fontWeight: 'bold'
        }
      },
      data: Object.entries(props.data.categories).map(([name, value]) => ({
        name,
        value,
        itemStyle: {
          color: getErrorColor(name)
        }
      }))
    }
  ]
})

// 获取错误类型对应的颜色
const getErrorColor = (type: string) => {
  const colors: Record<string, string> = {
    'API错误': '#F56C6C',
    '网络错误': '#E6A23C',
    '文件错误': '#409EFF',
    '系统错误': '#F56C6C',
    '其他': '#909399'
  }
  return colors[type] || colors['其他']
}

// 初始化图表
onMounted(() => {
  if (trendChartRef.value && categoryChartRef.value) {
    trendChart = echarts.init(trendChartRef.value)
    categoryChart = echarts.init(categoryChartRef.value)
    
    trendChart.setOption(getTrendChartOption())
    categoryChart.setOption(getCategoryChartOption())
    
    // 响应窗口大小变化
    window.addEventListener('resize', () => {
      trendChart?.resize()
      categoryChart?.resize()
    })
  }
})

// 监听数据变化
watch(
  () => props.data,
  () => {
    trendChart?.setOption(getTrendChartOption())
    categoryChart?.setOption(getCategoryChartOption())
  },
  { deep: true }
)
</script>

<style scoped>
.error-tracking-chart {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chart-container {
  display: flex;
  flex: 1;
  min-height: 0;
}

.trend-chart,
.category-chart {
  flex: 1;
  height: 100%;
}

.error-list {
  height: 150px;
  margin-top: 20px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.error-item {
  padding: 10px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.error-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.error-type {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
}

.error-type.error {
  background: var(--el-color-danger-light-9);
  color: var(--el-color-danger);
}

.error-type.warning {
  background: var(--el-color-warning-light-9);
  color: var(--el-color-warning);
}

.error-type.info {
  background: var(--el-color-info-light-9);
  color: var(--el-color-info);
}

.error-time {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.error-message {
  font-size: 13px;
  color: var(--el-text-color-primary);
  word-break: break-all;
}
</style> 