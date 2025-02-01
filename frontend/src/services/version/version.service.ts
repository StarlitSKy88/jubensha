import { ref } from 'vue'
import type { Script } from '@/types/script'

export interface Version {
  id: string
  timestamp: number
  content: string
  title: string
  description: string
  author: string
  changes: {
    type: 'add' | 'remove' | 'modify'
    path: string
    before?: string
    after?: string
  }[]
}

export interface VersionDiff {
  before: string
  after: string
  changes: {
    type: 'add' | 'remove' | 'modify'
    line: number
    content: string
  }[]
}

export class VersionService {
  private versions = new Map<string, Version>()
  private currentVersion = ref<string | null>(null)

  // 创建新版本
  async createVersion(script: Script, description: string): Promise<Version> {
    const version: Version = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      content: script.content,
      title: script.title,
      description,
      author: script.author,
      changes: []
    }

    // 计算与上一版本的差异
    if (this.currentVersion.value) {
      const prevVersion = this.versions.get(this.currentVersion.value)
      if (prevVersion) {
        version.changes = this.calculateChanges(prevVersion, version)
      }
    }

    this.versions.set(version.id, version)
    this.currentVersion.value = version.id

    return version
  }

  // 获取版本列表
  getVersions(): Version[] {
    return Array.from(this.versions.values()).sort((a, b) => b.timestamp - a.timestamp)
  }

  // 获取指定版本
  getVersion(id: string): Version | null {
    return this.versions.get(id) || null
  }

  // 切换到指定版本
  async switchVersion(id: string): Promise<Version | null> {
    const version = this.versions.get(id)
    if (!version) return null

    this.currentVersion.value = id
    return version
  }

  // 比较两个版本的差异
  async compareVersions(fromId: string, toId: string): Promise<VersionDiff | null> {
    const fromVersion = this.versions.get(fromId)
    const toVersion = this.versions.get(toId)

    if (!fromVersion || !toVersion) return null

    return {
      before: fromVersion.content,
      after: toVersion.content,
      changes: this.calculateLineChanges(fromVersion.content, toVersion.content)
    }
  }

  // 计算变更
  private calculateChanges(prev: Version, curr: Version): Version['changes'] {
    const changes: Version['changes'] = []

    // 标题变更
    if (prev.title !== curr.title) {
      changes.push({
        type: 'modify',
        path: 'title',
        before: prev.title,
        after: curr.title
      })
    }

    // 内容变更
    if (prev.content !== curr.content) {
      changes.push({
        type: 'modify',
        path: 'content',
        before: prev.content,
        after: curr.content
      })
    }

    return changes
  }

  // 计算行级变更
  private calculateLineChanges(before: string, after: string): VersionDiff['changes'] {
    const beforeLines = before.split('\n')
    const afterLines = after.split('\n')
    const changes: VersionDiff['changes'] = []

    let i = 0
    let j = 0

    while (i < beforeLines.length || j < afterLines.length) {
      if (i >= beforeLines.length) {
        // 新增行
        changes.push({
          type: 'add',
          line: j + 1,
          content: afterLines[j]
        })
        j++
      } else if (j >= afterLines.length) {
        // 删除行
        changes.push({
          type: 'remove',
          line: i + 1,
          content: beforeLines[i]
        })
        i++
      } else if (beforeLines[i] !== afterLines[j]) {
        // 修改行
        changes.push({
          type: 'modify',
          line: i + 1,
          content: afterLines[j]
        })
        i++
        j++
      } else {
        i++
        j++
      }
    }

    return changes
  }

  // 清除所有版本
  clear(): void {
    this.versions.clear()
    this.currentVersion.value = null
  }
} 