<template>
  <div
    ref="container"
    class="virtual-scroll"
    @scroll="handleScroll"
  >
    <div
      class="virtual-scroll-phantom"
      :style="{ height: totalHeight + 'px' }"
    />
    <div
      class="virtual-scroll-content"
      :style="{ transform: `translateY(${startOffset}px)` }"
    >
      <div
        v-for="item in visibleItems"
        :key="item.index"
        class="virtual-scroll-item"
        :style="{ height: itemHeight + 'px' }"
      >
        <slot :item="item.data" :index="item.index" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useThrottleFn, useRafFn } from '@vueuse/core'
import { usePerformanceMonitor } from '@/utils/performance'

const props = defineProps<{
  items: any[]
  itemHeight: number
  buffer?: number
  batchSize?: number
  debounceTime?: number
}>()

const container = ref<HTMLElement>()
const scrollTop = ref(0)
const clientHeight = ref(0)

// 添加性能监控
const { 
  startMeasure, 
  endMeasure, 
  getMetrics 
} = usePerformanceMonitor('virtual-scroll')

// 计算可见区域的起始索引和结束索引
const visibleRange = computed(() => {
  const start = Math.floor(scrollTop.value / props.itemHeight)
  const visibleCount = Math.ceil(clientHeight.value / props.itemHeight)
  const buffer = props.buffer || 5
  
  return {
    start: Math.max(0, start - buffer),
    end: Math.min(props.items.length, start + visibleCount + buffer)
  }
})

// 计算可见项目
const visibleItems = computed(() => {
  const { start, end } = visibleRange.value
  return props.items
    .slice(start, end)
    .map((item, index) => ({
      data: item,
      index: start + index
    }))
})

// 计算总高度
const totalHeight = computed(() => {
  return props.items.length * props.itemHeight
})

// 计算起始偏移
const startOffset = computed(() => {
  return visibleRange.value.start * props.itemHeight
})

// 优化滚动处理
const handleScroll = useThrottleFn((e: Event) => {
  if (!container.value) return
  
  startMeasure('scroll')
  
  scrollTop.value = container.value.scrollTop
  clientHeight.value = container.value.clientHeight
  
  endMeasure('scroll')
}, props.debounceTime || 16)

// 添加批量渲染逻辑
const batchRender = async (items: any[]) => {
  const batchSize = props.batchSize || 10
  const batches = Math.ceil(items.length / batchSize)
  
  startMeasure('batch-render')
  
  for (let i = 0; i < batches; i++) {
    const start = i * batchSize
    const end = Math.min(start + batchSize, items.length)
    const batch = items.slice(start, end)
    
    // 使用 requestAnimationFrame 进行批量渲染
    await new Promise(resolve => requestAnimationFrame(resolve))
    visibleItems.value.push(...batch)
  }
  
  endMeasure('batch-render')
}

// 添加内存监控
const monitorMemory = async () => {
  if ('performance' in window && 'memory' in performance) {
    const memory = (performance as any).memory
    console.log('Memory Usage:', {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize
    })
  }
}

// 初始化和清理
onMounted(() => {
  if (!container.value) return
  
  clientHeight.value = container.value.clientHeight
  
  // 监听容器大小变化
  const resizeObserver = new ResizeObserver((entries) => {
    startMeasure('resize')
    
    for (const entry of entries) {
      if (entry.target === container.value) {
        clientHeight.value = entry.contentRect.height
      }
    }
    
    endMeasure('resize')
  })
  
  resizeObserver.observe(container.value)
  
  // 定期监控内存
  const memoryMonitor = setInterval(monitorMemory, 5000)
  
  onUnmounted(() => {
    resizeObserver.disconnect()
    clearInterval(memoryMonitor)
  })
})

// 导出性能指标
defineExpose({
  getPerformanceMetrics: getMetrics
})
</script>

<style scoped lang="scss">
.virtual-scroll {
  position: relative;
  overflow-y: auto;
  height: 100%;
  
  .virtual-scroll-phantom {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    z-index: -1;
  }
  
  .virtual-scroll-content {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    min-height: 100%;
  }
  
  .virtual-scroll-item {
    width: 100%;
    box-sizing: border-box;
  }
}
</style> 