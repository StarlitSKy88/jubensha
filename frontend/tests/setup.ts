import { vi, beforeEach, afterEach } from 'vitest'
import { config } from '@vue/test-utils'
import ElementPlus from 'element-plus'

// 配置Vue Test Utils
config.global.plugins = [ElementPlus]

// 模拟ResizeObserver
class ResizeObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}

// 模拟IntersectionObserver
class IntersectionObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}

// 模拟MutationObserver
class MutationObserver {
  observe = vi.fn()
  disconnect = vi.fn()
  takeRecords = vi.fn()
}

// 模拟性能监控API
const performance = {
  mark: vi.fn(),
  measure: vi.fn(),
  clearMarks: vi.fn(),
  clearMeasures: vi.fn(),
  now: () => Date.now(),
  memory: {
    usedJSHeapSize: 0,
    totalJSHeapSize: 0,
    jsHeapSizeLimit: 0
  }
}

// 模拟本地存储
const localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0
}

const sessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0
}

// 模拟Fetch API
global.fetch = vi.fn()

// 模拟requestAnimationFrame
global.requestAnimationFrame = vi.fn(callback => setTimeout(callback, 0))
global.cancelAnimationFrame = vi.fn()

// 模拟定时器
const setTimeout = vi.fn() as unknown as typeof global.setTimeout
const setInterval = vi.fn() as unknown as typeof global.setInterval
const clearTimeout = vi.fn()
const clearInterval = vi.fn()

Object.defineProperties(global, {
  setTimeout: { value: setTimeout },
  setInterval: { value: setInterval },
  clearTimeout: { value: clearTimeout },
  clearInterval: { value: clearInterval }
})

// 模拟控制台
global.console = {
  ...console,
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn()
}

// 注入全局变量
Object.defineProperties(global, {
  ResizeObserver: { value: ResizeObserver },
  IntersectionObserver: { value: IntersectionObserver },
  MutationObserver: { value: MutationObserver },
  performance: { value: performance },
  localStorage: { value: localStorage },
  sessionStorage: { value: sessionStorage }
})

// 清理函数
beforeEach(() => {
  // 清理所有模拟函数
  vi.clearAllMocks()
  
  // 清理定时器
  vi.clearAllTimers()
  
  // 清理本地存储
  localStorage.clear()
  sessionStorage.clear()
  
  // 重置性能监控
  performance.clearMarks()
  performance.clearMeasures()
})

// 清理DOM
afterEach(() => {
  document.body.innerHTML = ''
}) 