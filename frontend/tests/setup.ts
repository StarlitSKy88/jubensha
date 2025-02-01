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

// 模拟 localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    }
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

const sessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0
}

// 模拟 fetch
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
  localStorage: { value: localStorageMock },
  sessionStorage: { value: sessionStorage }
})

// 模拟 Vue Router
config.global.mocks = {
  $router: {
    push: vi.fn(),
    replace: vi.fn()
  }
}

// 模拟环境变量
process.env = {
  ...process.env,
  VITE_API_BASE_URL: 'http://localhost:3000',
  VITE_API_TIMEOUT: '30000',
  VITE_API_MAX_RETRIES: '3',
  VITE_MAX_FILE_SIZE: '104857600',
  VITE_ALLOWED_FILE_TYPES: 'image/*,video/*,audio/*,application/pdf',
  VITE_MAX_CHUNK_SIZE: '1048576',
  VITE_MAX_CONCURRENT_CHUNKS: '3',
  VITE_RETRY_TIMES: '3',
  VITE_RETRY_DELAY: '1000',
  VITE_PERFORMANCE_SAMPLE_RATE: '100',
  VITE_ERROR_SAMPLE_RATE: '100',
  VITE_USER_ACTION_SAMPLE_RATE: '100'
}

// 清理函数
beforeEach(() => {
  // 清理所有模拟函数
  vi.clearAllMocks()
  
  // 清理定时器
  vi.clearAllTimers()
  
  // 清理本地存储
  localStorageMock.clear()
  sessionStorage.clear()
  
  // 重置性能监控
  performance.clearMarks()
  performance.clearMeasures()
})

// 清理DOM
afterEach(() => {
  document.body.innerHTML = ''
}) 