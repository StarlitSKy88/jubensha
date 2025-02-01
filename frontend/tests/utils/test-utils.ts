import { mount, VueWrapper } from '@vue/test-utils'
import { Component } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { vi } from 'vitest'

// 创建测试用的性能监控
export const createTestPerformanceMonitor = () => {
  const startMeasure = vi.fn()
  const endMeasure = vi.fn()
  const mark = vi.fn()
  const measure = vi.fn()
  const getMetrics = vi.fn()
  const clearMetrics = vi.fn()
  
  return {
    startMeasure,
    endMeasure,
    mark,
    measure,
    getMetrics,
    clearMetrics
  }
}

// 创建测试用的ResizeObserver
export const createTestResizeObserver = () => {
  const observe = vi.fn()
  const unobserve = vi.fn()
  const disconnect = vi.fn()
  
  return {
    observe,
    unobserve,
    disconnect
  }
}

// 创建测试用的IntersectionObserver
export const createTestIntersectionObserver = () => {
  const observe = vi.fn()
  const unobserve = vi.fn()
  const disconnect = vi.fn()
  
  return {
    observe,
    unobserve,
    disconnect
  }
}

// 创建测试用的MutationObserver
export const createTestMutationObserver = () => {
  const observe = vi.fn()
  const disconnect = vi.fn()
  const takeRecords = vi.fn()
  
  return {
    observe,
    disconnect,
    takeRecords
  }
}

// 创建测试用的存储
export const createTestStorage = () => {
  const storage = new Map<string, string>()
  
  return {
    getItem: (key: string) => storage.get(key) || null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
    clear: () => storage.clear(),
    key: (index: number) => Array.from(storage.keys())[index] || null,
    length: storage.size
  }
}

// 创建测试用的Fetch
export const createTestFetch = (response: any) => {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(response)
  })
}

// 创建测试用的错误Fetch
export const createTestErrorFetch = (error: Error) => {
  return vi.fn().mockRejectedValue(error)
}

// 创建组件挂载选项
export interface MountOptions {
  props?: Record<string, any>
  slots?: Record<string, string | Component>
  global?: Record<string, any>
}

// 挂载组件的辅助函数
export const mountComponent = <T extends Component>(
  component: T,
  options: MountOptions = {}
): VueWrapper => {
  // 初始化Pinia
  setActivePinia(createPinia())
  
  // 创建默认的全局配置
  const defaultGlobal = {
    provide: {
      performanceMonitor: createTestPerformanceMonitor()
    }
  }
  
  // 合并选项
  const mergedOptions = {
    props: options.props || {},
    slots: options.slots || {},
    global: {
      ...defaultGlobal,
      ...(options.global || {})
    }
  }
  
  return mount(component, mergedOptions)
}

// 等待组件更新
export const waitForUpdate = async () => {
  await new Promise(resolve => setTimeout(resolve, 0))
}

// 等待动画帧
export const waitForAnimationFrame = async () => {
  await new Promise(resolve => requestAnimationFrame(resolve))
}

// 等待指定时间
export const waitForTime = async (ms: number) => {
  await new Promise(resolve => setTimeout(resolve, ms))
}

// 创建测试用的DOM元素
export const createTestElement = (
  tag: string,
  attributes: Record<string, any> = {},
  style: Partial<CSSStyleDeclaration> = {}
) => {
  const element = document.createElement(tag)
  
  // 设置属性
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value)
  })
  
  // 设置样式
  Object.entries(style).forEach(([key, value]) => {
    element.style[key as any] = value
  })
  
  return element
}

// 创建测试用的事件
export const createTestEvent = (
  type: string,
  properties: Record<string, any> = {}
) => {
  const event = new Event(type)
  
  Object.entries(properties).forEach(([key, value]) => {
    Object.defineProperty(event, key, {
      value,
      enumerable: true
    })
  })
  
  return event
}

// 创建测试用的键盘事件
export const createTestKeyboardEvent = (
  key: string,
  properties: Record<string, any> = {}
) => {
  return new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    ...properties
  })
}

// 创建测试用的鼠标事件
export const createTestMouseEvent = (
  type: string,
  properties: Record<string, any> = {}
) => {
  return new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    ...properties
  })
}

// 创建测试用的触摸事件
export const createTestTouchEvent = (
  type: string,
  touches: Touch[] = []
) => {
  return new TouchEvent(type, {
    bubbles: true,
    cancelable: true,
    touches: touches as any
  })
}

// 创建测试用的剪贴板事件
export const createTestClipboardEvent = (
  type: string,
  data: string = ''
) => {
  return new ClipboardEvent(type, {
    bubbles: true,
    cancelable: true,
    clipboardData: new DataTransfer()
  })
}

// 创建测试用的拖拽事件
export const createTestDragEvent = (
  type: string,
  data: Record<string, any> = {}
) => {
  const event = new DragEvent(type, {
    bubbles: true,
    cancelable: true
  })
  
  const dataTransfer = new DataTransfer()
  Object.entries(data).forEach(([format, value]) => {
    dataTransfer.setData(format, value)
  })
  
  Object.defineProperty(event, 'dataTransfer', {
    value: dataTransfer,
    enumerable: true
  })
  
  return event
}

// 创建测试用的滚动事件
export const createTestScrollEvent = (
  properties: Record<string, any> = {}
) => {
  return new Event('scroll', {
    bubbles: true,
    cancelable: true,
    ...properties
  })
}

// 创建测试用的窗口大小变化事件
export const createTestResizeEvent = (
  properties: Record<string, any> = {}
) => {
  return new Event('resize', {
    bubbles: true,
    cancelable: true,
    ...properties
  })
}

// 创建测试用的可见性变化事件
export const createTestVisibilityEvent = (
  properties: Record<string, any> = {}
) => {
  return new Event('visibilitychange', {
    bubbles: true,
    cancelable: true,
    ...properties
  })
}

// 创建测试用的网络状态变化事件
export const createTestOnlineEvent = (online: boolean = true) => {
  return new Event(online ? 'online' : 'offline', {
    bubbles: true,
    cancelable: true
  })
}

// 创建测试用的焦点事件
export const createTestFocusEvent = (
  type: 'focus' | 'blur',
  properties: Record<string, any> = {}
) => {
  return new FocusEvent(type, {
    bubbles: true,
    cancelable: true,
    ...properties
  })
}

// 创建测试用的表单事件
export const createTestFormEvent = (
  type: string,
  properties: Record<string, any> = {}
) => {
  return new Event(type, {
    bubbles: true,
    cancelable: true,
    ...properties
  })
}

// 创建测试用的动画事件
export const createTestAnimationEvent = (
  type: string,
  properties: Record<string, any> = {}
) => {
  return new AnimationEvent(type, {
    bubbles: true,
    cancelable: true,
    ...properties
  })
}

// 创建测试用的过渡事件
export const createTestTransitionEvent = (
  type: string,
  properties: Record<string, any> = {}
) => {
  return new TransitionEvent(type, {
    bubbles: true,
    cancelable: true,
    ...properties
  })
} 