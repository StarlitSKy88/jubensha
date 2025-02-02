// 快捷键配置类型
export interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean
  description: string
  action: () => void
  id?: string              // 快捷键唯一标识
  category?: string        // 快捷键分类
  isDefault?: boolean      // 是否为默认快捷键
  platform?: 'all' | 'mac' | 'windows' // 平台限制
}

// 快捷键冲突错误
export class ShortcutConflictError extends Error {
  constructor(public shortcut1: KeyboardShortcut, public shortcut2: KeyboardShortcut) {
    super(`快捷键冲突: ${getShortcutDescription(shortcut1)} 与 ${getShortcutDescription(shortcut2)}`)
  }
}

// 获取快捷键描述
export function getShortcutDescription(shortcut: KeyboardShortcut): string {
  const parts: string[] = []
  
  // 根据平台显示不同的按键
  const isMac = navigator.platform.toLowerCase().includes('mac')
  
  if (shortcut.meta) {
    parts.push(isMac ? '⌘' : 'Win')
  }
  if (shortcut.ctrl) {
    parts.push(isMac ? '⌃' : 'Ctrl')
  }
  if (shortcut.alt) {
    parts.push(isMac ? '⌥' : 'Alt')
  }
  if (shortcut.shift) {
    parts.push(isMac ? '⇧' : 'Shift')
  }
  
  parts.push(shortcut.key.toUpperCase())
  
  return parts.join('+')
}

export class KeyboardManager {
  private shortcuts: Map<string, KeyboardShortcut>
  private enabled: boolean
  private customShortcuts: Map<string, KeyboardShortcut>
  
  constructor() {
    this.shortcuts = new Map()
    this.customShortcuts = new Map()
    this.enabled = true
    
    // 加载自定义快捷键
    this.loadCustomShortcuts()
  }
  
  // 添加快捷键
  addShortcut(shortcut: KeyboardShortcut) {
    // 检查平台兼容性
    if (!this.isPlatformCompatible(shortcut)) {
      return
    }
    
    const key = this.getShortcutKey(shortcut)
    
    // 检查冲突
    const existing = this.shortcuts.get(key)
    if (existing) {
      throw new ShortcutConflictError(existing, shortcut)
    }
    
    // 添加快捷键
    this.shortcuts.set(key, {
      ...shortcut,
      id: shortcut.id || key
    })
  }
  
  // 移除快捷键
  removeShortcut(shortcut: KeyboardShortcut) {
    const key = this.getShortcutKey(shortcut)
    this.shortcuts.delete(key)
  }
  
  // 自定义快捷键
  customizeShortcut(id: string, newShortcut: Partial<KeyboardShortcut>) {
    // 获取原快捷键
    const original = Array.from(this.shortcuts.values()).find(s => s.id === id)
    if (!original) {
      throw new Error(`快捷键 ${id} 不存在`)
    }
    
    // 移除原快捷键
    this.removeShortcut(original)
    
    // 添加新快捷键
    const customized: KeyboardShortcut = {
      ...original,
      ...newShortcut
    }
    
    try {
      this.addShortcut(customized)
      // 保存自定义配置
      this.customShortcuts.set(id, customized)
      this.saveCustomShortcuts()
    } catch (error) {
      // 恢复原快捷键
      this.addShortcut(original)
      throw error
    }
  }
  
  // 重置快捷键
  resetShortcut(id: string) {
    // 获取默认快捷键
    const defaultShortcut = defaultEditorShortcuts.find(s => s.id === id)
    if (!defaultShortcut) {
      throw new Error(`快捷键 ${id} 不存在`)
    }
    
    // 移除自定义配置
    this.customShortcuts.delete(id)
    this.saveCustomShortcuts()
    
    // 重新添加默认快捷键
    const current = Array.from(this.shortcuts.values()).find(s => s.id === id)
    if (current) {
      this.removeShortcut(current)
    }
    this.addShortcut(defaultShortcut)
  }
  
  // 启用快捷键
  enable() {
    this.enabled = true
  }
  
  // 禁用快捷键
  disable() {
    this.enabled = false
  }
  
  // 处理键盘事件
  handleKeyDown(event: KeyboardEvent) {
    if (!this.enabled) return
    
    const key = this.getEventKey({
      key: event.key.toLowerCase(),
      ctrl: event.ctrlKey,
      shift: event.shiftKey,
      alt: event.altKey,
      meta: event.metaKey,
      description: '',
      action: () => {}
    })
    
    const shortcut = this.shortcuts.get(key)
    if (shortcut) {
      event.preventDefault()
      shortcut.action()
    }
  }
  
  // 获取所有快捷键
  getShortcuts(): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values())
  }
  
  // 获取分类的快捷键
  getShortcutsByCategory(category: string): KeyboardShortcut[] {
    return this.getShortcuts().filter(s => s.category === category)
  }
  
  // 检查平台兼容性
  private isPlatformCompatible(shortcut: KeyboardShortcut): boolean {
    if (!shortcut.platform || shortcut.platform === 'all') {
      return true
    }
    
    const isMac = navigator.platform.toLowerCase().includes('mac')
    return (shortcut.platform === 'mac' && isMac) || 
           (shortcut.platform === 'windows' && !isMac)
  }
  
  // 加载自定义快捷键
  private loadCustomShortcuts() {
    try {
      const saved = localStorage.getItem('keyboard_shortcuts')
      if (saved) {
        const shortcuts = JSON.parse(saved)
        this.customShortcuts = new Map(Object.entries(shortcuts))
        
        // 应用自定义快捷键
        for (const [id, shortcut] of this.customShortcuts) {
          const original = defaultEditorShortcuts.find(s => s.id === id)
          if (original) {
            this.customizeShortcut(id, shortcut)
          }
        }
      }
    } catch (error) {
      console.error('加载自定义快捷键失败:', error)
    }
  }
  
  // 保存自定义快捷键
  private saveCustomShortcuts() {
    try {
      const shortcuts = Object.fromEntries(this.customShortcuts)
      localStorage.setItem('keyboard_shortcuts', JSON.stringify(shortcuts))
    } catch (error) {
      console.error('保存自定义快捷键失败:', error)
    }
  }
  
  // 生成快捷键唯一标识
  private getShortcutKey(shortcut: KeyboardShortcut): string {
    return this.getEventKey(shortcut)
  }
  
  // 生成事件唯一标识
  private getEventKey(shortcut: KeyboardShortcut): string {
    const parts: string[] = []
    
    if (shortcut.meta) parts.push('meta')
    if (shortcut.ctrl) parts.push('ctrl')
    if (shortcut.alt) parts.push('alt')
    if (shortcut.shift) parts.push('shift')
    
    parts.push(shortcut.key.toLowerCase())
    
    return parts.join('+')
  }
}

// 默认编辑器快捷键
export const defaultEditorShortcuts: KeyboardShortcut[] = [
  {
    id: 'format',
    key: 'f',
    ctrl: true,
    shift: true,
    description: '格式化剧本',
    category: '编辑',
    isDefault: true,
    action: () => {}
  },
  {
    id: 'undo',
    key: 'z',
    ctrl: true,
    description: '撤销',
    category: '编辑',
    isDefault: true,
    action: () => {}
  },
  {
    id: 'redo',
    key: 'y',
    ctrl: true,
    description: '重做',
    category: '编辑',
    isDefault: true,
    action: () => {}
  },
  {
    id: 'scene',
    key: 'b',
    ctrl: true,
    description: '添加场景',
    category: '插入',
    isDefault: true,
    action: () => {}
  },
  {
    id: 'character',
    key: 'r',
    ctrl: true,
    description: '添加角色',
    category: '插入',
    isDefault: true,
    action: () => {}
  },
  {
    id: 'dialog',
    key: 'd',
    ctrl: true,
    description: '添加对话',
    category: '插入',
    isDefault: true,
    action: () => {}
  },
  {
    id: 'action',
    key: 'a',
    ctrl: true,
    description: '添加动作',
    category: '插入',
    isDefault: true,
    action: () => {}
  },
  {
    id: 'transition',
    key: 't',
    ctrl: true,
    description: '添加转场',
    category: '插入',
    isDefault: true,
    action: () => {}
  },
  {
    id: 'ai',
    key: ' ',
    ctrl: true,
    description: 'AI助手',
    category: '工具',
    isDefault: true,
    action: () => {}
  }
]

// 创建编辑器快捷键管理器
export function createEditorKeyboardManager(actions: Record<string, () => void>): KeyboardManager {
  const manager = new KeyboardManager()
  
  defaultEditorShortcuts.forEach(shortcut => {
    const actionName = shortcut.description
    if (actions[actionName]) {
      shortcut.action = actions[actionName]
      manager.addShortcut(shortcut)
    }
  })
  
  return manager
} 