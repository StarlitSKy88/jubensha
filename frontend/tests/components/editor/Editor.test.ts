import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import Editor from '@/components/editor/Editor.vue'
import { createPinia, setActivePinia } from 'pinia'
import { createTestPerformanceMonitor } from '@/tests/utils/test-utils'

describe('Editor', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  const mockLines = Array.from({ length: 10 }, (_, i) => ({
    id: `line-${i}`,
    content: `Line ${i}`
  }))

  const createWrapper = (options = {}) => {
    return mount(Editor, {
      global: {
        provide: {
          performanceMonitor: createTestPerformanceMonitor()
        },
        ...options
      }
    })
  }

  it('renders correctly', () => {
    const wrapper = createWrapper()
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.editor').exists()).toBe(true)
    expect(wrapper.find('.editor-toolbar').exists()).toBe(true)
    expect(wrapper.find('.editor-content').exists()).toBe(true)
  })

  it('initializes with empty state', () => {
    const wrapper = createWrapper()
    expect(wrapper.vm.lines).toHaveLength(0)
    expect(wrapper.vm.isLoading).toBe(false)
    expect(wrapper.vm.error).toBeNull()
  })

  it('loads content successfully', async () => {
    const wrapper = createWrapper()
    const store = wrapper.vm.store

    store.lines = mockLines
    await wrapper.vm.$nextTick()

    const editorLines = wrapper.findAll('.editor-line')
    expect(editorLines).toHaveLength(mockLines.length)
    editorLines.forEach((line, index) => {
      expect(line.text()).toContain(mockLines[index].content)
    })
  })

  it('handles line click', async () => {
    const wrapper = createWrapper()
    const store = wrapper.vm.store
    store.lines = mockLines

    await wrapper.vm.$nextTick()
    const firstLine = wrapper.find('.editor-line')
    await firstLine.trigger('click')

    expect(wrapper.vm.activeLine).toBe(0)
    expect(firstLine.classes()).toContain('is-active')
  })

  it('handles line update', async () => {
    const wrapper = createWrapper()
    const store = wrapper.vm.store
    store.lines = mockLines

    await wrapper.vm.$nextTick()
    const firstLine = wrapper.find('.editor-line')
    const newContent = 'Updated content'

    await firstLine.vm.$emit('update', newContent)
    expect(store.lines[0].content).toBe(newContent)
  })

  it('measures performance for content loading', async () => {
    const startMeasure = vi.fn()
    const endMeasure = vi.fn()

    const wrapper = createWrapper({
      provide: {
        performanceMonitor: {
          startMeasure,
          endMeasure
        }
      }
    })

    await wrapper.vm.loadContent()

    expect(startMeasure).toHaveBeenCalledWith('load-content')
    expect(endMeasure).toHaveBeenCalledWith('load-content')
  })

  it('handles scroll events', async () => {
    const wrapper = createWrapper()
    const store = wrapper.vm.store
    store.lines = Array.from({ length: 1000 }, (_, i) => ({
      id: `line-${i}`,
      content: `Line ${i}`
    }))

    await wrapper.vm.$nextTick()
    const content = wrapper.find('.editor-content')
    await content.trigger('scroll')

    expect(wrapper.vm.scrollTop).toBeGreaterThan(0)
  })

  it('handles window resize', async () => {
    const wrapper = createWrapper()
    const store = wrapper.vm.store
    store.lines = mockLines

    await wrapper.vm.$nextTick()
    window.dispatchEvent(new Event('resize'))

    expect(wrapper.vm.containerHeight).toBeGreaterThan(0)
    expect(wrapper.vm.containerWidth).toBeGreaterThan(0)
  })

  it('cleans up on unmount', () => {
    const wrapper = createWrapper()
    const clearInterval = vi.fn()
    const disconnect = vi.fn()

    wrapper.unmount()

    expect(clearInterval).toHaveBeenCalled()
    expect(disconnect).toHaveBeenCalled()
  })

  it('handles keyboard shortcuts', async () => {
    const wrapper = createWrapper()
    const store = wrapper.vm.store
    store.lines = mockLines

    await wrapper.vm.$nextTick()
    await wrapper.trigger('keydown.ctrl.s')

    expect(wrapper.emitted('save')).toBeTruthy()
  })

  it('handles file drop', async () => {
    const wrapper = createWrapper()
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' })
    const dropEvent = new Event('drop')
    Object.defineProperty(dropEvent, 'dataTransfer', {
      value: {
        files: [file]
      }
    })

    await wrapper.find('.editor').trigger('drop', dropEvent)
    expect(wrapper.vm.store.lines).not.toHaveLength(0)
  })

  it('handles paste events', async () => {
    const wrapper = createWrapper()
    const pasteEvent = new Event('paste')
    Object.defineProperty(pasteEvent, 'clipboardData', {
      value: {
        getData: () => 'Pasted content'
      }
    })

    await wrapper.find('.editor').trigger('paste', pasteEvent)
    expect(wrapper.vm.store.lines).not.toHaveLength(0)
  })

  it('handles error states', async () => {
    const wrapper = createWrapper()
    const store = wrapper.vm.store
    const error = 'Test error'
    store.error = error

    await wrapper.vm.$nextTick()
    expect(wrapper.find('.error-message').text()).toBe(error)
  })

  it('handles loading states', async () => {
    const wrapper = createWrapper()
    const store = wrapper.vm.store
    store.isLoading = true

    await wrapper.vm.$nextTick()
    expect(wrapper.find('.loading-indicator').exists()).toBe(true)
  })

  it('measures performance for all operations', async () => {
    const startMeasure = vi.fn()
    const endMeasure = vi.fn()

    const wrapper = createWrapper({
      provide: {
        performanceMonitor: {
          startMeasure,
          endMeasure
        }
      }
    })

    // 测试加载性能
    await wrapper.vm.loadContent()
    expect(startMeasure).toHaveBeenCalledWith('load-content')
    expect(endMeasure).toHaveBeenCalledWith('load-content')

    // 测试滚动性能
    await wrapper.find('.editor-content').trigger('scroll')
    expect(startMeasure).toHaveBeenCalledWith('handle-scroll')
    expect(endMeasure).toHaveBeenCalledWith('handle-scroll')

    // 测试更新性能
    await wrapper.find('.editor-line').vm.$emit('update', 'new content')
    expect(startMeasure).toHaveBeenCalledWith('update-line')
    expect(endMeasure).toHaveBeenCalledWith('update-line')
  })
}) 