/// <reference types="vite/client" />

interface ImportMetaEnv {
  // LangSmith 配置
  readonly LANGSMITH_API_KEY: string
  readonly LANGSMITH_ENDPOINT: string
  readonly LANGSMITH_PROJECT_NAME: string

  // 应用配置
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_VERSION: string

  // 性能监控配置
  readonly VITE_PERFORMANCE_SAMPLE_RATE: string
  readonly VITE_ERROR_SAMPLE_RATE: string
  readonly VITE_USER_ACTION_SAMPLE_RATE: string

  // 文件上传配置
  readonly VITE_MAX_FILE_SIZE: string
  readonly VITE_ALLOWED_FILE_TYPES: string
  readonly VITE_MAX_CHUNK_SIZE: string
  readonly VITE_MAX_CONCURRENT_CHUNKS: string
  readonly VITE_RETRY_TIMES: string
  readonly VITE_RETRY_DELAY: string

  // API 配置
  readonly VITE_API_BASE_URL: string
  readonly VITE_API_TIMEOUT: string
  readonly VITE_API_MAX_RETRIES: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
  }
} 