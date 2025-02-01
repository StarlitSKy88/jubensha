<template>
  <div
    ref="containerRef"
    class="virtual-scroll"
    @scroll="handleScroll"
  >
    <div
      ref="contentRef"
      class="virtual-scroll-phantom"
      :style="{ height: `${totalHeight}px` }"
    />
    <div
      class="virtual-scroll-content"
      :style="contentStyle"
    >
      <slot
        v-for="(item, index) in visibleItems"
        :key="item.id"
        :item="item"
        :index="startIndex + index"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { usePerformanceMonitor } from '@/utils/performance'
import { debounce } from '@/utils/helpers'

const props = defineProps<{
  items: any[]
  itemHeight: number
  buffer?: number
  batchSize?: number
  debounceTime?: number
}>()

const emit = defineEmits<{
  (e: 'scroll', scrollTop: number): void
  (e: 'visible-items-change', items: any[]): void
}>()

// 性能监控
const { startMeasure, endMeasure } = usePerformanceMonitor()

// 容器引用
const containerRef = ref<HTMLElement>()
const contentRef = ref<HTMLElement>()

// 滚动状态
const scrollTop = ref(0)
const containerHeight = ref(0)
const containerWidth = ref(0)

// 计算属性
const totalHeight = computed(() => props.items.length * props.itemHeight)
const visibleCount = computed(() => Math.ceil(containerHeight.value / props.itemHeight))
const bufferSize = computed(() => props.buffer || 5)
const batchSize = computed(() => props.batchSize || 10)

// 可见项目范围
const startIndex = computed(() => {
  const start = Math.floor(scrollTop.value / props.itemHeight) - bufferSize.value
  return Math.max(0, start)
})

const endIndex = computed(() => {
  const end = startIndex.value + visibleCount.value + 2 * bufferSize.value
  return Math.min(props.items.length, end)
})

// 可见项目列表
const visibleItems = computed(() => {
  startMeasure('get-visible-items')
  const items = props.items.slice(startIndex.value, endIndex.value)
  endMeasure('get-visible-items')
  return items
})

// 内容样式
const contentStyle = computed(() => ({
  height: `${totalHeight.value}px`,
  transform: `translateY(${startIndex.value * props.itemHeight}px)`
}))

// 批量渲染
const batchRender = async (items: any[]) => {
  startMeasure('batch-render')
  for (let i = 0; i < items.length; i += batchSize.value) {
    const batch = items.slice(i, i + batchSize.value)
    await new Promise(resolve => requestAnimationFrame(resolve))
    emit('visible-items-change', batch)
  }
  endMeasure('batch-render')
}

// 滚动处理
const handleScroll = debounce((e: Event) => {
  startMeasure('handle-scroll')
  const target = e.target as HTMLElement
  scrollTop.value = target.scrollTop
  emit('scroll', scrollTop.value)
  endMeasure('handle-scroll')
}, props.debounceTime || 16)

// 窗口大小变化处理
const resizeObserver = new ResizeObserver(entries => {
  startMeasure('resize')
  for (const entry of entries) {
    if (entry.target === containerRef.value) {
      containerHeight.value = entry.contentRect.height
      containerWidth.value = entry.contentRect.width
    }
  }
  endMeasure('resize')
})

// 内存监控
const monitorMemory = () => {
  if (performance.memory) {
    console.log('Memory Usage:', {
      usedJSHeapSize: performance.memory.usedJSHeapSize,
      totalJSHeapSize: performance.memory.totalJSHeapSize
    })
  }
}

// 生命周期钩子
onMounted(() => {
  if (containerRef.value) {
    resizeObserver.observe(containerRef.value)
    containerHeight.value = containerRef.value.clientHeight
    containerWidth.value = containerRef.value.clientWidth
  }
  
  // 启动内存监控
  const memoryMonitorInterval = setInterval(monitorMemory, 5000)
  
  // 清理函数
  onUnmounted(() => {
    resizeObserver.disconnect()
    clearInterval(memoryMonitorInterval)
  })
})

// 监听可见项目变化
watch(visibleItems, (items) => {
  batchRender(items)
}, { immediate: true })
</script>

<style scoped>
.virtual-scroll {
  position: relative;
  height: 100%;
  overflow-y: auto;
  contain: strict;
  will-change: transform;
}

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
  will-change: transform;
}
</style> 