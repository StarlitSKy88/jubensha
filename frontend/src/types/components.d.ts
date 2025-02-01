import { DefineComponent } from 'vue'

// 通用组件属性
export interface BaseProps {
  class?: string
  style?: string | Record<string, string>
}

// 文件信息接口
export interface FileInfo {
  name: string
  type: string
  size: number
  url: string
  uploaded_at: string
}

// 个人资料接口
export interface Profile {
  nickname: string
  bio: string
  location: string
  website: string
  gender: string
  birthday: string
  avatar_url?: string
}

// 用户设置接口
export interface UserSettings {
  language: string
  timezone: string
  theme: string
  notification_email: boolean
  notification_web: boolean
}

// 组件属性类型
export interface ProfileViewProps extends BaseProps {
  initialProfile?: Profile
}

export interface SettingsViewProps extends BaseProps {
  initialSettings?: UserSettings
}

export interface FilesViewProps extends BaseProps {
  maxFileSize?: number
  allowedTypes?: string[]
}

// 声明Vue组件
declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    ProfileView: DefineComponent<ProfileViewProps>
    SettingsView: DefineComponent<SettingsViewProps>
    FilesView: DefineComponent<FilesViewProps>
  }
}

// 扩展Vue类型
declare module 'vue' {
  interface ComponentCustomProperties {
    $formatFileSize: (size: number) => string
    $formatDate: (date: string) => string
  }
} 