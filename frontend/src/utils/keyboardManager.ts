// 快捷键配置类型
export interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean
  description: string
  action: () => void
}

export class KeyboardManager {
  private shortcuts: Map<string, KeyboardShortcut>
  private enabled: boolean

  constructor() {
    this.shortcuts = new Map()
    this.enabled = true
  }

  // 添加快捷键
  addShortcut(shortcut: KeyboardShortcut) {
    const key = this.getShortcutKey(shortcut)
    this.shortcuts.set(key, shortcut)
  }

  // 移除快捷键
  removeShortcut(shortcut: KeyboardShortcut) {
    const key = this.getShortcutKey(shortcut)
    this.shortcuts.delete(key)
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

  // 获取快捷键描述
  getShortcutDescription(shortcut: KeyboardShortcut): string {
    const parts: string[] = []
    
    if (shortcut.ctrl) parts.push('Ctrl')
    if (shortcut.shift) parts.push('Shift')
    if (shortcut.alt) parts.push('Alt')
    if (shortcut.meta) parts.push('Meta')
    
    parts.push(shortcut.key.toUpperCase())
    
    return parts.join('+')
  }

  // 生成快捷键唯一标识
  private getShortcutKey(shortcut: KeyboardShortcut): string {
    return this.getEventKey(shortcut)
  }

  // 生成事件唯一标识
  private getEventKey(shortcut: KeyboardShortcut): string {
    const parts: string[] = []
    
    if (shortcut.ctrl) parts.push('ctrl')
    if (shortcut.shift) parts.push('shift')
    if (shortcut.alt) parts.push('alt')
    if (shortcut.meta) parts.push('meta')
    
    parts.push(shortcut.key.toLowerCase())
    
    return parts.join('+')
  }
}

// 默认编辑器快捷键
export const defaultEditorShortcuts: KeyboardShortcut[] = [
  {
    key: 'f',
    ctrl: true,
    shift: true,
    description: '格式化剧本',
    action: () => {}
  },
  {
    key: 'z',
    ctrl: true,
    description: '撤销',
    action: () => {}
  },
  {
    key: 'y',
    ctrl: true,
    description: '重做',
    action: () => {}
  },
  {
    key: 'b',
    ctrl: true,
    description: '添加场景',
    action: () => {}
  },
  {
    key: 'r',
    ctrl: true,
    description: '添加角色',
    action: () => {}
  },
  {
    key: 'd',
    ctrl: true,
    description: '添加对话',
    action: () => {}
  },
  {
    key: 'a',
    ctrl: true,
    description: '添加动作',
    action: () => {}
  },
  {
    key: 't',
    ctrl: true,
    description: '添加转场',
    action: () => {}
  },
  {
    key: ' ',
    ctrl: true,
    description: 'AI助手',
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