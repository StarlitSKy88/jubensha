// 角色类型
export interface Character {
  id: string
  name: string
  description?: string
  tags?: string[]
  created_at: string
  updated_at: string
}

// 场景类型
export interface Scene {
  id: string
  title: string
  content: string
  characters: string[] // 角色ID列表
  parentId?: string // 父场景ID，用于场景嵌套
  order: number // 场景顺序
  created_at: string
  updated_at: string
}

// 剧本类型
export interface Script {
  id: string
  title: string
  content: string
  description?: string
  characters: Character[]
  scenes: Scene[]
  tags?: string[]
  format: 'stage' | 'screen' | 'radio' // 剧本格式：舞台剧/电影/广播剧
  status: 'draft' | 'review' | 'published' // 剧本状态
  version: string // 版本号
  created_at: string
  updated_at: string
}

// AI建议请求类型
export interface AIRequest {
  scriptId: string
  action: 'plot' | 'dialog' | 'character' | 'scene'
  context: string
}

// AI建议响应类型
export interface AISuggestion {
  content: string
  type: 'plot' | 'dialog' | 'character' | 'scene'
  confidence: number
  alternatives?: string[]
  created_at: string
}

// 编辑器配置类型
export interface EditorConfig {
  autoSave: boolean
  autoSaveInterval: number
  fontSize: number
  fontFamily: string
  theme: 'light' | 'dark'
  shortcuts: Record<string, string>
}

// 编辑器状态类型
export interface EditorState {
  content: string
  selection: {
    start: number
    end: number
  }
  undoStack: string[]
  redoStack: string[]
  isSaved: boolean
  lastSaved?: string
} 