import { defineStore } from 'pinia'
import { ref } from 'vue'
import { FormatService, type FormatConfig } from '@/services/format.service'

export const useEditorStore = defineStore('editor', () => {
  // 状态
  const content = ref('')
  const lines = ref<string[]>([])
  const undoStack = ref<string[]>([])
  const redoStack = ref<string[]>([])
  const formatService = new FormatService()

  // 加载内容
  const loadContent = () => {
    // 从本地存储加载
    const saved = localStorage.getItem('editor_content')
    if (saved) {
      content.value = saved
      lines.value = saved.split('\n')
    }
  }

  // 保存内容
  const saveContent = () => {
    localStorage.setItem('editor_content', content.value)
  }

  // 更新内容
  const updateContent = (newContent: string) => {
    // 保存当前状态用于撤销
    undoStack.value.push(content.value)
    redoStack.value = []

    // 更新内容
    content.value = newContent
    lines.value = newContent.split('\n')

    // 保存内容
    saveContent()
  }

  // 格式化内容
  const formatContent = (config?: Partial<FormatConfig>) => {
    if (config) {
      formatService.updateConfig(config)
    }

    const formatted = formatService.format(content.value)
    updateContent(formatted)
  }

  // 撤销
  const undo = () => {
    if (undoStack.value.length === 0) return

    // 保存当前状态用于重做
    redoStack.value.push(content.value)

    // 恢复上一个状态
    const previousContent = undoStack.value.pop()!
    content.value = previousContent
    lines.value = previousContent.split('\n')

    // 保存内容
    saveContent()
  }

  // 重做
  const redo = () => {
    if (redoStack.value.length === 0) return

    // 保存当前状态用于撤销
    undoStack.value.push(content.value)

    // 恢复下一个状态
    const nextContent = redoStack.value.pop()!
    content.value = nextContent
    lines.value = nextContent.split('\n')

    // 保存内容
    saveContent()
  }

  // 添加场景
  const addScene = () => {
    const scene = '内景 场景 - 日'
    updateContent(content.value + '\n\n' + scene)
  }

  // 添加角色
  const addCharacter = () => {
    const character = '张三'
    updateContent(content.value + '\n\n' + character)
  }

  // 添加对话
  const addDialog = () => {
    const dialog = '这是一段对话。'
    updateContent(content.value + '\n' + dialog)
  }

  // 添加动作
  const addAction = () => {
    const action = '这是一段动作描述。'
    updateContent(content.value + '\n\n' + action)
  }

  // 添加转场
  const addTransition = () => {
    const transition = 'CUT TO:'
    updateContent(content.value + '\n\n' + transition)
  }

  return {
    content,
    lines,
    loadContent,
    saveContent,
    updateContent,
    formatContent,
    undo,
    redo,
    addScene,
    addCharacter,
    addDialog,
    addAction,
    addTransition
  }
}) 