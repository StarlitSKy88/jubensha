import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import VirtualScroll from '@/components/editor/VirtualScroll.vue'

describe('VirtualScroll', () => {
  const mockItems = Array.from({ length: 1000 }, (_, i) => ({
    id: `item-${i}`,
    content: `Item ${i}`
  }))
  
  const defaultProps = {
    items: mockItems,
    itemHeight: 24,
    buffer: 5,
    batchSize: 10,
    debounceTime: 16
  }
  
  let wrapper: ReturnType<typeof mount>
  
  beforeEach(() => {
    wrapper = mount(VirtualScroll, {
      props: defaultProps,
      slots: {
        default: `
          <template #default="{ item, index }">
            <div>{{ item.content }}</div>
          </template>
        `
      }
    })
  })
  
  it('renders correctly', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.virtual-scroll').exists()).toBe(true)
    expect(wrapper.find('.virtual-scroll-phantom').exists()).toBe(true)
    expect(wrapper.find('.virtual-scroll-content').exists()).toBe(true)
  })
  
  it('calculates total height correctly', () => {
    const phantom = wrapper.find('.virtual-scroll-phantom')
    expect(phantom.attributes('style')).toContain(`height: ${mockItems.length * defaultProps.itemHeight}px`)
  })
  
  it('renders visible items only', async () => {
    const container = wrapper.find('.virtual-scroll')
    const containerHeight = 500
    Object.defineProperty(container.element, 'clientHeight', { value: containerHeight })
    
    await container.trigger('scroll')
    
    const visibleCount = Math.ceil(containerHeight / defaultProps.itemHeight)
    const totalVisibleItems = visibleCount + 2 * defaultProps.buffer
    
    const items = wrapper.findAll('.virtual-scroll-item')
    expect(items.length).toBeLessThanOrEqual(totalVisibleItems)
  })
  
  it('updates on scroll', async () => {
    const container = wrapper.find('.virtual-scroll')
    const scrollTop = 100
    
    Object.defineProperty(container.element, 'scrollTop', { value: scrollTop })
    await container.trigger('scroll')
    
    const content = wrapper.find('.virtual-scroll-content')
    const startIndex = Math.floor(scrollTop / defaultProps.itemHeight)
    const expectedOffset = startIndex * defaultProps.itemHeight
    
    expect(content.attributes('style')).toContain(`transform: translateY(${expectedOffset}px)`)
  })
  
  it('handles batch rendering', async () => {
    const startMeasure = vi.fn()
    const endMeasure = vi.fn()
    
    wrapper = mount(VirtualScroll, {
      props: {
        ...defaultProps,
        items: mockItems.slice(0, 100)
      },
      global: {
        provide: {
          performanceMonitor: {
            startMeasure,
            endMeasure
          }
        }
      }
    })
    
    await wrapper.vm.$nextTick()
    
    expect(startMeasure).toHaveBeenCalledWith('batch-render')
    expect(endMeasure).toHaveBeenCalledWith('batch-render')
  })
  
  it('monitors memory usage', async () => {
    const mockMemory = {
      usedJSHeapSize: 1000000,
      totalJSHeapSize: 2000000
    }
    
    const originalPerformance = global.performance
    global.performance = {
      ...originalPerformance,
      memory: mockMemory
    }
    
    const consoleSpy = vi.spyOn(console, 'log')
    
    wrapper = mount(VirtualScroll, {
      props: defaultProps
    })
    
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    expect(consoleSpy).toHaveBeenCalledWith('Memory Usage:', {
      usedJSHeapSize: mockMemory.usedJSHeapSize,
      totalJSHeapSize: mockMemory.totalJSHeapSize
    })
    
    global.performance = originalPerformance
  })
  
  it('handles window resize', async () => {
    const resizeObserver = wrapper.vm.resizeObserver
    const startMeasure = vi.fn()
    const endMeasure = vi.fn()
    
    wrapper = mount(VirtualScroll, {
      props: defaultProps,
      global: {
        provide: {
          performanceMonitor: {
            startMeasure,
            endMeasure
          }
        }
      }
    })
    
    const container = wrapper.find('.virtual-scroll').element
    resizeObserver.observe(container)
    
    // 触发resize
    const resizeEvent = new Event('resize')
    window.dispatchEvent(resizeEvent)
    
    await wrapper.vm.$nextTick()
    
    expect(startMeasure).toHaveBeenCalledWith('resize')
    expect(endMeasure).toHaveBeenCalledWith('resize')
  })
  
  it('cleans up on unmount', () => {
    const clearInterval = vi.fn()
    const disconnect = vi.fn()
    
    wrapper = mount(VirtualScroll, {
      props: defaultProps,
      global: {
        provide: {
          resizeObserver: {
            disconnect
          }
        }
      }
    })
    
    wrapper.unmount()
    
    expect(disconnect).toHaveBeenCalled()
    expect(clearInterval).toHaveBeenCalled()
  })
}) 