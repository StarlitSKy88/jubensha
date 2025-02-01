<template>
  <div class="file-status-chart">
    <div ref="chartRef" class="chart"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'

const props = defineProps<{
  data: {
    processed: number
    processing: number
    failed: number
    queued: number
  }
}>()

const chartRef = ref<HTMLElement>()
let chart: echarts.ECharts | null = null

// 图表配置
const getChartOption = (): EChartsOption => ({
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c} ({d}%)'
  },
  legend: {
    orient: 'vertical',
    left: 'left',
    data: ['已处理', '处理中', '失败', '等待中']
  },
  series: [
    {
      name: '文件状态',
      type: 'pie',
      radius: ['50%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 20,
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false
      },
      data: [
        {
          value: props.data.processed,
          name: '已处理',
          itemStyle: { color: '#67C23A' }
        },
        {
          value: props.data.processing,
          name: '处理中',
          itemStyle: { color: '#409EFF' }
        },
        {
          value: props.data.failed,
          name: '失败',
          itemStyle: { color: '#F56C6C' }
        },
        {
          value: props.data.queued,
          name: '等待中',
          itemStyle: { color: '#E6A23C' }
        }
      ]
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
.file-status-chart {
  width: 100%;
  height: 100%;
}

.chart {
  width: 100%;
  height: 100%;
}
</style> 