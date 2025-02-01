// 角色类型
export interface Character {
  id: string
  name: string
  age: number
  gender: '男' | '女' | '其他'
  occupation: string
  background: string
  personality: string[]
  relationships: Map<string, string>
  secrets: string[]
  goals: string[]
  items: string[]
}

// 场景类型
export interface Scene {
  id: string
  name: string
  description: string
  location: string
  time: string
  participants: string[]
  clues: string[]
  events: string[]
  requirements: string[]
  nextScenes: string[]
}

// 剧本类型
export interface Script {
  id: string
  title: string
  content: string
  author: string
  characters: Map<string, Character>
  scenes: Map<string, Scene>
  clues: Map<string, Clue>
  createdAt: number
  updatedAt: number
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

export interface Clue {
  id: string
  name: string
  description: string
  type: '物品' | '对话' | '场景' | '文档'
  relatedCharacters: string[]
  discoveryConditions: string[]
  importance: number
  isKey: boolean
} 