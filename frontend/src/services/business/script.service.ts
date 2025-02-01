import { ref } from 'vue'
import type { Ref } from 'vue'

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

// 线索类型
export interface Clue {
  id: string
  name: string
  description: string
  type: '物品' | '对话' | '场景' | '文档'
  relatedCharacters: string[]
  discoveryConditions: string[]
  importance: 1 | 2 | 3 | 4 | 5
  isKey: boolean
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
  author: string
  createdAt: Date
  updatedAt: Date
  type: '本格' | '变格' | '新本格' | '半本格' | '其他'
  difficulty: 1 | 2 | 3 | 4 | 5
  playerCount: {
    min: number
    max: number
  }
  duration: number
  tags: string[]
  summary: string
  background: string
  characters: Map<string, Character>
  scenes: Map<string, Scene>
  clues: Map<string, Clue>
  timeline: string[]
  endings: string[]
  version: string
}

// 剧本服务
export class ScriptService {
  private scripts = ref<Map<string, Script>>(new Map())
  private activeScript: Ref<string | null> = ref(null)

  // 创建新剧本
  createScript(title: string, author: string): Script {
    const script: Script = {
      id: crypto.randomUUID(),
      title,
      author,
      createdAt: new Date(),
      updatedAt: new Date(),
      type: '本格',
      difficulty: 3,
      playerCount: {
        min: 6,
        max: 8
      },
      duration: 180,
      tags: [],
      summary: '',
      background: '',
      characters: new Map(),
      scenes: new Map(),
      clues: new Map(),
      timeline: [],
      endings: [],
      version: '1.0.0'
    }

    this.scripts.value.set(script.id, script)
    this.activeScript.value = script.id
    return script
  }

  // 添加角色
  addCharacter(scriptId: string, character: Omit<Character, 'id'>): Character {
    const script = this.getScript(scriptId)
    if (!script) {
      throw new Error('剧本不存在')
    }

    const newCharacter: Character = {
      ...character,
      id: crypto.randomUUID()
    }

    script.characters.set(newCharacter.id, newCharacter)
    script.updatedAt = new Date()
    return newCharacter
  }

  // 添加场景
  addScene(scriptId: string, scene: Omit<Scene, 'id'>): Scene {
    const script = this.getScript(scriptId)
    if (!script) {
      throw new Error('剧本不存在')
    }

    const newScene: Scene = {
      ...scene,
      id: crypto.randomUUID()
    }

    script.scenes.set(newScene.id, newScene)
    script.updatedAt = new Date()
    return newScene
  }

  // 添加线索
  addClue(scriptId: string, clue: Omit<Clue, 'id'>): Clue {
    const script = this.getScript(scriptId)
    if (!script) {
      throw new Error('剧本不存在')
    }

    const newClue: Clue = {
      ...clue,
      id: crypto.randomUUID()
    }

    script.clues.set(newClue.id, newClue)
    script.updatedAt = new Date()
    return newClue
  }

  // 更新剧本
  updateScript(scriptId: string, updates: Partial<Omit<Script, 'id' | 'createdAt' | 'updatedAt'>>): Script {
    const script = this.getScript(scriptId)
    if (!script) {
      throw new Error('剧本不存在')
    }

    Object.assign(script, updates)
    script.updatedAt = new Date()
    return script
  }

  // 更新角色
  updateCharacter(scriptId: string, characterId: string, updates: Partial<Omit<Character, 'id'>>): Character {
    const script = this.getScript(scriptId)
    if (!script) {
      throw new Error('剧本不存在')
    }

    const character = script.characters.get(characterId)
    if (!character) {
      throw new Error('角色不存在')
    }

    Object.assign(character, updates)
    script.updatedAt = new Date()
    return character
  }

  // 更新场景
  updateScene(scriptId: string, sceneId: string, updates: Partial<Omit<Scene, 'id'>>): Scene {
    const script = this.getScript(scriptId)
    if (!script) {
      throw new Error('剧本不存在')
    }

    const scene = script.scenes.get(sceneId)
    if (!scene) {
      throw new Error('场景不存在')
    }

    Object.assign(scene, updates)
    script.updatedAt = new Date()
    return scene
  }

  // 更新线索
  updateClue(scriptId: string, clueId: string, updates: Partial<Omit<Clue, 'id'>>): Clue {
    const script = this.getScript(scriptId)
    if (!script) {
      throw new Error('剧本不存在')
    }

    const clue = script.clues.get(clueId)
    if (!clue) {
      throw new Error('线索不存在')
    }

    Object.assign(clue, updates)
    script.updatedAt = new Date()
    return clue
  }

  // 删除剧本
  deleteScript(scriptId: string): void {
    if (!this.scripts.value.delete(scriptId)) {
      throw new Error('剧本不存在')
    }

    if (this.activeScript.value === scriptId) {
      this.activeScript.value = null
    }
  }

  // 删除角色
  deleteCharacter(scriptId: string, characterId: string): void {
    const script = this.getScript(scriptId)
    if (!script) {
      throw new Error('剧本不存在')
    }

    if (!script.characters.delete(characterId)) {
      throw new Error('角色不存在')
    }

    script.updatedAt = new Date()
  }

  // 删除场景
  deleteScene(scriptId: string, sceneId: string): void {
    const script = this.getScript(scriptId)
    if (!script) {
      throw new Error('剧本不存在')
    }

    if (!script.scenes.delete(sceneId)) {
      throw new Error('场景不存在')
    }

    script.updatedAt = new Date()
  }

  // 删除线索
  deleteClue(scriptId: string, clueId: string): void {
    const script = this.getScript(scriptId)
    if (!script) {
      throw new Error('剧本不存在')
    }

    if (!script.clues.delete(clueId)) {
      throw new Error('线索不存在')
    }

    script.updatedAt = new Date()
  }

  // 获取剧本
  getScript(id: string): Script | undefined {
    return this.scripts.value.get(id)
  }

  // 获取活动剧本
  getActiveScript(): Script | undefined {
    return this.activeScript.value ? this.scripts.value.get(this.activeScript.value) : undefined
  }

  // 获取所有剧本
  getAllScripts(): Script[] {
    return Array.from(this.scripts.value.values())
  }

  // 导出剧本
  exportScript(scriptId: string): string {
    const script = this.getScript(scriptId)
    if (!script) {
      throw new Error('剧本不存在')
    }

    return JSON.stringify(script, (key, value) => {
      if (value instanceof Map) {
        return Array.from(value.entries())
      }
      return value
    }, 2)
  }

  // 导入剧本
  importScript(scriptData: string): Script {
    try {
      const data = JSON.parse(scriptData, (key, value) => {
        if (Array.isArray(value) && value.every(item => Array.isArray(item) && item.length === 2)) {
          return new Map(value)
        }
        return value
      })

      const script: Script = {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt)
      }

      this.scripts.value.set(script.id, script)
      return script
    } catch (error) {
      throw new Error('剧本数据格式错误')
    }
  }
} 