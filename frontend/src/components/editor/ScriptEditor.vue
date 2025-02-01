<template>
  <div class="script-editor">
    <div class="editor-header">
      <div class="title-section">
        <input
          v-model="title"
          type="text"
          placeholder="剧本标题"
          @change="handleTitleChange"
        >
      </div>
      <div class="toolbar">
        <button @click="handleSave">保存</button>
        <button @click="handleAIAssist">AI 助手</button>
        <button @click="handleFormat">格式化</button>
        <button @click="showShortcuts = true">快捷键</button>
      </div>
    </div>

    <div class="editor-main">
      <div class="sidebar">
        <div class="section">
          <h3>角色列表</h3>
          <div class="character-list">
            <div
              v-for="char in characters"
              :key="char.id"
              class="character-item"
              @click="handleCharacterClick(char)"
            >
              {{ char.name }}
            </div>
            <button @click="handleAddCharacter">添加角色</button>
          </div>
        </div>

        <div class="section">
          <h3>场景列表</h3>
          <div class="scene-list">
            <div
              v-for="scene in scenes"
              :key="scene.id"
              class="scene-item"
              @click="handleSceneClick(scene)"
            >
              {{ scene.name }}
            </div>
            <button @click="handleAddScene">添加场景</button>
          </div>
        </div>

        <div class="section">
          <h3>线索列表</h3>
          <div class="clue-list">
            <div
              v-for="clue in clues"
              :key="clue.id"
              class="clue-item"
              @click="handleClueClick(clue)"
            >
              {{ clue.name }}
            </div>
            <button @click="handleAddClue">添加线索</button>
          </div>
        </div>
      </div>

      <div class="content-area">
        <rich-text-editor
          v-model="content"
          placeholder="在这里开始创作..."
          @change="handleContentChange"
        />
      </div>

      <div class="ai-assistant" v-if="showAIAssistant">
        <div class="assistant-header">
          <h3>AI 助手</h3>
          <button @click="showAIAssistant = false">关闭</button>
        </div>
        <div class="assistant-content">
          <div class="suggestions">
            <div v-for="(suggestion, index) in aiSuggestions" :key="index" class="suggestion-item">
              <div class="suggestion-type">{{ suggestion.type }}</div>
              <div class="suggestion-content">{{ suggestion.content }}</div>
              <button @click="applySuggestion(suggestion)">应用</button>
            </div>
          </div>
          <div class="assistant-input">
            <input
              v-model="assistantPrompt"
              type="text"
              placeholder="输入你的需求..."
              @keyup.enter="handleAssistantPrompt"
            >
            <button @click="handleAssistantPrompt">发送</button>
          </div>
        </div>
      </div>
    </div>

    <div class="editor-footer">
      <div class="status-bar">
        {{ statusText }}
      </div>
      <div class="word-count">
        字数：{{ wordCount }}
      </div>
    </div>

    <shortcut-help-dialog
      v-if="showShortcuts"
      :visible="showShortcuts"
      :shortcuts="keyboardShortcuts"
      @update:visible="showShortcuts = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useScriptStore } from '@/stores/script'
import { useKeyboardManager } from '@/utils/keyboardManager'
import { usePerformanceMonitor } from '@/utils/performance'
import RichTextEditor from './RichTextEditor.vue'
import ShortcutHelpDialog from './ShortcutHelpDialog.vue'
import type { Character, Scene, Clue } from '@/types/script'
import type { WritingAdvice } from '@/services/ai/assistant.ai.service'
import { useAutoSave } from '@/composables/useAutoSave'

// 状态
const scriptStore = useScriptStore()
const title = ref('')
const content = ref('')
const characters = ref<Character[]>([])
const scenes = ref<Scene[]>([])
const clues = ref<Clue[]>([])
const showAIAssistant = ref(false)
const showShortcuts = ref(false)
const aiSuggestions = ref<WritingAdvice[]>([])
const assistantPrompt = ref('')

// 性能监控
const { startMeasure, endMeasure } = usePerformanceMonitor()

// 自动保存
const { isSaving, lastSaveTime, hasUnsavedChanges, saveError, triggerSave } = useAutoSave({
  save: async () => {
    startMeasure('save-script')
    try {
      await scriptStore.saveScript()
    } catch (error) {
      console.error('保存失败：', error)
      throw error
    } finally {
      endMeasure('save-script')
    }
  },
  interval: 30000, // 30 秒
  delay: 1000     // 1 秒
})

// 更新状态栏显示
const statusText = computed(() => {
  if (isSaving.value) {
    return '正在保存...'
  }
  if (saveError.value) {
    return `保存失败：${saveError.value.message}`
  }
  if (hasUnsavedChanges.value) {
    return '有未保存的更改'
  }
  return `上次保存：${new Date(lastSaveTime.value).toLocaleTimeString()}`
})

// 键盘快捷键
const keyboardManager = useKeyboardManager({
  'Ctrl+S': {
    description: '保存',
    action: handleSave
  },
  'Ctrl+Space': {
    description: 'AI 助手',
    action: () => showAIAssistant.value = !showAIAssistant.value
  },
  'Ctrl+Shift+F': {
    description: '格式化',
    action: handleFormat
  },
  'Ctrl+?': {
    description: '快捷键帮助',
    action: () => showShortcuts.value = true
  }
})

// 事件处理
const handleTitleChange = () => {
  startMeasure('update-title')
  scriptStore.updateTitle(title.value)
  triggerSave()
  endMeasure('update-title')
}

const handleSave = async () => {
  startMeasure('save-script')
  try {
    await scriptStore.saveScript()
  } catch (error) {
    console.error('保存失败：', error)
  } finally {
    endMeasure('save-script')
  }
}

const handleAIAssist = () => {
  showAIAssistant.value = true
}

const handleFormat = () => {
  startMeasure('format-script')
  scriptStore.formatScript()
  endMeasure('format-script')
}

const handleContentChange = (newContent: string) => {
  startMeasure('update-content')
  scriptStore.updateContent(newContent)
  triggerSave()
  endMeasure('update-content')
}

const handleCharacterClick = (character: Character) => {
  // TODO: 显示角色详情对话框
}

const handleAddCharacter = () => {
  // TODO: 显示添加角色对话框
}

const handleSceneClick = (scene: Scene) => {
  // TODO: 显示场景详情对话框
}

const handleAddScene = () => {
  // TODO: 显示添加场景对话框
}

const handleClueClick = (clue: Clue) => {
  // TODO: 显示线索详情对话框
}

const handleAddClue = () => {
  // TODO: 显示添加线索对话框
}

const handleAssistantPrompt = async () => {
  if (!assistantPrompt.value) return

  startMeasure('ai-assist')
  try {
    const suggestions = await scriptStore.getAISuggestions(assistantPrompt.value)
    aiSuggestions.value = suggestions
  } catch (error) {
    console.error('获取建议失败：', error)
  } finally {
    endMeasure('ai-assist')
    assistantPrompt.value = ''
  }
}

const applySuggestion = (suggestion: WritingAdvice) => {
  startMeasure('apply-suggestion')
  // TODO: 应用 AI 建议
  endMeasure('apply-suggestion')
}

// 生命周期
onMounted(() => {
  keyboardManager.enable()
  
  // 加载剧本数据
  const script = scriptStore.currentScript
  if (script) {
    title.value = script.title
    content.value = script.content
    characters.value = Array.from(script.characters.values())
    scenes.value = Array.from(script.scenes.values())
    clues.value = Array.from(script.clues.values())
  }
})

onBeforeUnmount(() => {
  keyboardManager.disable()
})
</script>

<style scoped lang="scss">
.script-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .editor-header {
    padding: 1rem;
    border-bottom: 1px solid var(--color-border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .title-section {
      input {
        font-size: 1.5rem;
        border: none;
        outline: none;
        width: 300px;
        
        &:focus {
          border-bottom: 2px solid var(--color-primary);
        }
      }
    }
    
    .toolbar {
      display: flex;
      gap: 1rem;
      
      button {
        padding: 0.5rem 1rem;
        border: 1px solid var(--color-border);
        border-radius: 4px;
        background: none;
        cursor: pointer;
        transition: all 0.2s;
        
        &:hover {
          background-color: var(--color-primary);
          color: white;
          border-color: var(--color-primary);
        }
      }
    }
  }
  
  .editor-main {
    flex: 1;
    display: flex;
    overflow: hidden;
    
    .sidebar {
      width: 250px;
      border-right: 1px solid var(--color-border);
      overflow-y: auto;
      
      .section {
        padding: 1rem;
        
        h3 {
          margin: 0 0 1rem;
          font-size: 1rem;
          color: var(--color-text-light);
        }
        
        .character-list,
        .scene-list,
        .clue-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          
          .character-item,
          .scene-item,
          .clue-item {
            padding: 0.5rem;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.2s;
            
            &:hover {
              background-color: rgba(74, 144, 226, 0.1);
            }
          }
          
          button {
            margin-top: 0.5rem;
            padding: 0.5rem;
            border: 1px dashed var(--color-border);
            border-radius: 4px;
            background: none;
            cursor: pointer;
            transition: all 0.2s;
            
            &:hover {
              border-color: var(--color-primary);
              color: var(--color-primary);
            }
          }
        }
      }
    }
    
    .content-area {
      flex: 1;
      overflow: hidden;
    }
    
    .ai-assistant {
      width: 300px;
      border-left: 1px solid var(--color-border);
      display: flex;
      flex-direction: column;
      
      .assistant-header {
        padding: 1rem;
        border-bottom: 1px solid var(--color-border);
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        h3 {
          margin: 0;
          font-size: 1rem;
        }
        
        button {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--color-text-light);
          
          &:hover {
            color: var(--color-primary);
          }
        }
      }
      
      .assistant-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        
        .suggestions {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
          
          .suggestion-item {
            margin-bottom: 1rem;
            padding: 1rem;
            border-radius: 4px;
            background-color: rgba(74, 144, 226, 0.1);
            
            .suggestion-type {
              font-size: 0.875rem;
              color: var(--color-primary);
              margin-bottom: 0.5rem;
            }
            
            .suggestion-content {
              margin-bottom: 0.5rem;
            }
            
            button {
              padding: 0.25rem 0.5rem;
              border: 1px solid var(--color-primary);
              border-radius: 4px;
              background: none;
              color: var(--color-primary);
              cursor: pointer;
              transition: all 0.2s;
              
              &:hover {
                background-color: var(--color-primary);
                color: white;
              }
            }
          }
        }
        
        .assistant-input {
          padding: 1rem;
          border-top: 1px solid var(--color-border);
          display: flex;
          gap: 0.5rem;
          
          input {
            flex: 1;
            padding: 0.5rem;
            border: 1px solid var(--color-border);
            border-radius: 4px;
            outline: none;
            
            &:focus {
              border-color: var(--color-primary);
            }
          }
          
          button {
            padding: 0.5rem 1rem;
            border: none;
            border-radius: 4px;
            background-color: var(--color-primary);
            color: white;
            cursor: pointer;
            transition: all 0.2s;
            
            &:hover {
              background-color: var(--color-primary-dark);
            }
          }
        }
      }
    }
  }

  .editor-footer {
    padding: 0.5rem;
    border-top: 1px solid var(--color-border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .status-bar {
      color: var(--color-text-secondary);
      font-size: 0.875rem;
    }
    
    .word-count {
      color: var(--color-text-secondary);
      font-size: 0.875rem;
    }
  }
}
</style> 