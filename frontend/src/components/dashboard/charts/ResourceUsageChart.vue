<template>
  <div class="resource-usage-chart">
    <div ref="chartRef" class="chart"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'

const props = defineProps<{
  data: {
    memory: number[]
    cpu: number[]
    network: number[]
  }
}>()

const chartRef = ref<HTMLElement>()
let chart: echarts.ECharts | null = null

// 生成时间数据
const generateTimeData = () => {
  const now = new Date()
  return Array.from({ length: 30 }, (_, i) => {
    const time = new Date(now.getTime() - (29 - i) * 1000)
    return time.toLocaleTimeString('zh-CN', { hour12: false })
  })
}

// 图表配置
const getChartOption = (): EChartsOption => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      label: {
        backgroundColor: '#6a7985'
      }
    }
  },
  legend: {
    data: ['内存使用', 'CPU使用率', '网络带宽']
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: [
    {
      type: 'category',
      boundaryGap: false,
      data: generateTimeData()
    }
  ],
  yAxis: [
    {
      type: 'value',
      name: '使用率 (%)',
      min: 0,
      max: 100,
      position: 'left',
      axisLine: {
        show: true,
        lineStyle: {
          color: '#5470C6'
        }
      },
      axisLabel: {
        formatter: '{value}%'
      }
    },
    {
      type: 'value',
      name: '带宽 (MB/s)',
      min: 0,
      max: 100,
      position: 'right',
      axisLine: {
        show: true,
        lineStyle: {
          color: '#91CC75'
        }
      },
      axisLabel: {
        formatter: '{value} MB/s'
      }
    }
  ],
  series: [
    {
      name: '内存使用',
      type: 'line',
      smooth: true,
      data: props.data.memory,
      itemStyle: {
        color: '#5470C6'
      },
      areaStyle: {
        opacity: 0.1
      }
    },
    {
      name: 'CPU使用率',
      type: 'line',
      smooth: true,
      data: props.data.cpu,
      itemStyle: {
        color: '#EE6666'
      },
      areaStyle: {
        opacity: 0.1
      }
    },
    {
      name: '网络带宽',
      type: 'line',
      smooth: true,
      yAxisIndex: 1,
      data: props.data.network,
      itemStyle: {
        color: '#91CC75'
      },
      areaStyle: {
        opacity: 0.1
      }
    }
  ]
})

// 初始化图表
onMounted(() => {
  if (chartRef.value) {
    chart = echarts.init(chartRef.value)
    chart.setOption(getChartOption())
    
    // 响应窗口大小变化
    window.addEventListener('resize', () => {
      chart?.resize()
    })
  }
})

// 监听数据变化
watch(
  () => props.data,
  () => {
    chart?.setOption(getChartOption())
  },
  { deep: true }
)
</script>

<style scoped>
.resource-usage-chart {
  width: 100%;
  height: 100%;
}

.chart {
  width: 100%;
  height: 100%;
}
</style> 