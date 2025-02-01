import { vi } from 'vitest'
import type { Mock } from 'vitest'

// 创建模拟函数
export const createMockFn = <T extends (...args: any[]) => any>(): Mock<Parameters<T>, ReturnType<T>> => {
  return vi.fn() as Mock<Parameters<T>, ReturnType<T>>
}

// 创建模拟Promise
export const createMockPromise = <T>(value: T): Promise<T> => {
  return Promise.resolve(value)
}

// 创建模拟错误Promise
export const createMockErrorPromise = (error: Error): Promise<never> => {
  return Promise.reject(error)
}

// 创建模拟定时器
export const createMockTimer = () => {
  return {
    setTimeout: vi.fn(),
    clearTimeout: vi.fn(),
    setInterval: vi.fn(),
    clearInterval: vi.fn()
  }
}

// 创建模拟事件
export const createMockEvent = (type: string, properties: Record<string, any> = {}) => {
  const event = new Event(type)
  Object.assign(event, properties)
  return event
}

// 创建模拟DOM元素
export const createMockElement = (tag: string, properties: Record<string, any> = {}) => {
  const element = document.createElement(tag)
  Object.assign(element, properties)
  return element
}

// 创建模拟组件
export const createMockComponent = (name: string, props: Record<string, any> = {}) => {
  return {
    name,
    props,
    render: vi.fn()
  }
}

// 创建模拟Store
export const createMockStore = <T extends Record<string, any>>(state: T) => {
  return {
    state: { ...state },
    commit: vi.fn(),
    dispatch: vi.fn(),
    getters: {}
  }
}

// 创建模拟路由
export const createMockRouter = (options: Record<string, any> = {}) => {
  return {
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    ...options
  }
}

// 创建模拟请求
export const createMockRequest = (options: Record<string, any> = {}) => {
  return {
    url: 'http://example.com',
    method: 'GET',
    headers: {},
    body: null,
    ...options
  }
}

// 创建模拟响应
export const createMockResponse = (options: Record<string, any> = {}) => {
  return {
    status: 200,
    statusText: 'OK',
    headers: {},
    body: null,
    ...options
  }
}

// 创建模拟WebSocket
export const createMockWebSocket = () => {
  return {
    send: vi.fn(),
    close: vi.fn(),
    onmessage: null,
    onclose: null,
    onerror: null,
    onopen: null,
    readyState: WebSocket.CONNECTING
  }
}

// 创建模拟Worker
export const createMockWorker = () => {
  return {
    postMessage: vi.fn(),
    terminate: vi.fn(),
    onmessage: null,
    onerror: null
  }
}

// 创建模拟Storage
export const createMockStorage = () => {
  const store = new Map<string, string>()
  
  return {
    getItem: vi.fn((key: string) => store.get(key) || null),
    setItem: vi.fn((key: string, value: string) => store.set(key, value)),
    removeItem: vi.fn((key: string) => store.delete(key)),
    clear: vi.fn(() => store.clear()),
    key: vi.fn((index: number) => Array.from(store.keys())[index] || null),
    length: store.size
  }
}

// 创建模拟FormData
export const createMockFormData = (data: Record<string, any> = {}) => {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value)
  })
  return formData
}

// 创建模拟File
export const createMockFile = (name: string, content: string, type: string = 'text/plain') => {
  return new File([content], name, { type })
}

// 创建模拟Blob
export const createMockBlob = (content: string, type: string = 'text/plain') => {
  return new Blob([content], { type })
}

// 创建模拟URL
export const createMockURL = (url: string) => {
  return {
    href: url,
    protocol: 'https:',
    host: 'example.com',
    hostname: 'example.com',
    port: '',
    pathname: '/',
    search: '',
    hash: ''
  }
}

// 创建模拟Location
export const createMockLocation = (url: string) => {
  const mockUrl = createMockURL(url)
  return {
    ...mockUrl,
    assign: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn()
  }
}

// 创建模拟History
export const createMockHistory = () => {
  return {
    length: 1,
    state: null,
    scrollRestoration: 'auto' as const,
    pushState: vi.fn(),
    replaceState: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn()
  }
}

// 创建模拟Navigator
export const createMockNavigator = () => {
  return {
    userAgent: 'test',
    language: 'en-US',
    languages: ['en-US'],
    onLine: true,
    clipboard: {
      writeText: vi.fn(),
      readText: vi.fn()
    }
  }
}

// 创建模拟Screen
export const createMockScreen = () => {
  return {
    width: 1920,
    height: 1080,
    availWidth: 1920,
    availHeight: 1080,
    colorDepth: 24,
    pixelDepth: 24
  }
}

// 创建模拟Performance
export const createMockPerformance = () => {
  return {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    clearMarks: vi.fn(),
    clearMeasures: vi.fn(),
    getEntriesByType: vi.fn(),
    getEntriesByName: vi.fn()
  }
}

// 创建模拟Console
export const createMockConsole = () => {
  return {
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn()
  }
}

// 创建模拟Window
export const createMockWindow = () => {
  return {
    innerWidth: 1920,
    innerHeight: 1080,
    location: createMockLocation('https://example.com'),
    history: createMockHistory(),
    navigator: createMockNavigator(),
    screen: createMockScreen(),
    performance: createMockPerformance(),
    console: createMockConsole(),
    localStorage: createMockStorage(),
    sessionStorage: createMockStorage(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
    setTimeout: vi.fn(),
    clearTimeout: vi.fn(),
    setInterval: vi.fn(),
    clearInterval: vi.fn(),
    requestAnimationFrame: vi.fn(),
    cancelAnimationFrame: vi.fn()
  }
}

// 创建模拟Document
export const createMockDocument = () => {
  return {
    createElement: vi.fn((tag: string) => createMockElement(tag)),
    querySelector: vi.fn(),
    querySelectorAll: vi.fn(),
    getElementById: vi.fn(),
    getElementsByClassName: vi.fn(),
    getElementsByTagName: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }
}

// 创建模拟Global
export const createMockGlobal = () => {
  return {
    window: createMockWindow(),
    document: createMockDocument(),
    navigator: createMockNavigator(),
    location: createMockLocation('https://example.com'),
    history: createMockHistory(),
    localStorage: createMockStorage(),
    sessionStorage: createMockStorage(),
    console: createMockConsole(),
    performance: createMockPerformance(),
    fetch: vi.fn(),
    XMLHttpRequest: vi.fn(),
    WebSocket: vi.fn(),
    Worker: vi.fn(),
    File: vi.fn(),
    Blob: vi.fn(),
    FormData: vi.fn(),
    URL: vi.fn(),
    URLSearchParams: vi.fn()
  }
} 