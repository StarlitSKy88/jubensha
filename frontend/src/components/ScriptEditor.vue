<template>
  <div class="script-editor">
    <div class="editor-toolbar">
      <el-button-group>
        <el-button :icon="DocumentAdd" @click="createNewScene">新建场景</el-button>
        <el-button :icon="Edit" @click="addCharacterDialog">添加角色</el-button>
        <el-button :icon="Position" @click="addSceneHeading">添加场景标题</el-button>
      </el-button-group>
      
      <el-button-group>
        <el-button :icon="ChatDotRound" @click="addDialog">添加对话</el-button>
        <el-button :icon="Reading" @click="addAction">添加动作</el-button>
        <el-button :icon="Connection" @click="addTransition">添加转场</el-button>
      </el-button-group>

      <el-button-group>
        <el-button :icon="Magic" @click="requestAIHelp" :loading="aiLoading">AI助手</el-button>
        <el-button :icon="Share" @click="shareScript">分享</el-button>
        <el-button :icon="Download" @click="exportScript">导出</el-button>
      </el-button-group>
    </div>

    <div class="editor-main" ref="editorRef">
      <div class="editor-content" contenteditable="true" @input="handleInput" @keydown="handleKeydown">
        {{ content }}
      </div>

      <div class="editor-sidebar">
        <div class="character-list">
          <h3>角色列表</h3>
          <el-tag
            v-for="char in characters"
            :key="char.id"
            closable
            @close="removeCharacter(char.id)"
          >
            {{ char.name }}
          </el-tag>
        </div>

        <div class="scene-list">
          <h3>场景列表</h3>
          <el-tree :data="scenes" @node-click="jumpToScene" />
        </div>
      </div>
    </div>

    <div class="editor-footer">
      <div class="word-count">字数：{{ wordCount }}</div>
      <div class="save-status">{{ saveStatus }}</div>
    </div>

    <!-- AI助手对话框 -->
    <el-dialog v-model="aiDialogVisible" title="AI助手" width="50%">
      <div class="ai-options">
        <el-radio-group v-model="aiAction">
          <el-radio label="plot">情节建议</el-radio>
          <el-radio label="dialog">对话优化</el-radio>
          <el-radio label="character">角色设计</el-radio>
          <el-radio label="scene">场景描写</el-radio>
        </el-radio-group>
      </div>
      
      <div class="ai-content">
        <div v-if="aiLoading" class="ai-loading">
          <el-icon class="is-loading"><Loading /></el-icon>
          正在生成建议...
        </div>
        <div v-else class="ai-suggestion">{{ aiSuggestion }}</div>
      </div>

      <template #footer>
        <el-button @click="aiDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="applyAISuggestion">应用建议</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  DocumentAdd,
  Edit,
  Position,
  ChatDotRound,
  Reading,
  Connection,
  Magic,
  Share,
  Download,
  Loading
} from '@element-plus/icons-vue'
import { useScriptStore } from '@/stores/script'
import type { Character, Scene } from '@/types/script'

const props = defineProps<{
  scriptId: string
}>()

const scriptStore = useScriptStore()
const content = ref('')
const characters = ref<Character[]>([])
const scenes = ref<Scene[]>([])
const wordCount = ref(0)
const saveStatus = ref('已保存')
const aiLoading = ref(false)
const aiDialogVisible = ref(false)
const aiAction = ref('plot')
const aiSuggestion = ref('')

// 自动保存定时器
let autoSaveTimer: NodeJS.Timeout

onMounted(async () => {
  try {
    const script = await scriptStore.getScript(props.scriptId)
    content.value = script.content
    characters.value = script.characters
    scenes.value = script.scenes
    updateWordCount()
    
    // 设置自动保存
    autoSaveTimer = setInterval(saveScript, 30000)
  } catch (error) {
    console.error('Failed to load script:', error)
    ElMessage.error('加载剧本失败')
  }
})

onUnmounted(() => {
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer)
  }
})

// 编辑器功能
function handleInput() {
  updateWordCount()
  saveStatus.value = '未保存'
}

function handleKeydown(e: KeyboardEvent) {
  // 处理快捷键
  if (e.ctrlKey || e.metaKey) {
    switch(e.key) {
      case 's':
        e.preventDefault()
        saveScript()
        break
      case 'b':
        e.preventDefault()
        addSceneHeading()
        break
      case 'd':
        e.preventDefault()
        addDialog()
        break
      case 'a':
        e.preventDefault()
        addAction()
        break
    }
  }
}

async function saveScript() {
  try {
    await scriptStore.updateScript({
      id: props.scriptId,
      content: content.value,
      characters: characters.value,
      scenes: scenes.value
    })
    saveStatus.value = '已保存'
  } catch (error) {
    console.error('Failed to save script:', error)
    ElMessage.error('保存失败')
  }
}

function updateWordCount() {
  wordCount.value = content.value.length
}

// 工具栏功能
function createNewScene() {
  // 实现新建场景
}

function addCharacterDialog() {
  // 实现添加角色
}

function addSceneHeading() {
  // 实现添加场景标题
}

function addDialog() {
  // 实现添加对话
}

function addAction() {
  // 实现添加动作
}

function addTransition() {
  // 实现添加转场
}

async function requestAIHelp() {
  aiDialogVisible.value = true
  aiLoading.value = true
  
  try {
    const suggestion = await scriptStore.getAISuggestion({
      scriptId: props.scriptId,
      action: aiAction.value,
      context: getSelectedContent()
    })
    
    aiSuggestion.value = suggestion
  } catch (error) {
    console.error('Failed to get AI suggestion:', error)
    ElMessage.error('获取AI建议失败')
  } finally {
    aiLoading.value = false
  }
}

function applyAISuggestion() {
  // 实现应用AI建议
  aiDialogVisible.value = false
}

function shareScript() {
  // 实现分享功能
}

function exportScript() {
  // 实现导出功能
}

// 辅助功能
function getSelectedContent(): string {
  const selection = window.getSelection()
  return selection?.toString() || ''
}

function jumpToScene(scene: Scene) {
  // 实现跳转到场景
}

function removeCharacter(id: string) {
  // 实现删除角色
}
</script>

<style scoped lang="scss">
.script-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
}

.editor-toolbar {
  padding: 10px;
  border-bottom: 1px solid #dcdfe6;
  display: flex;
  gap: 10px;
}

.editor-main {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.editor-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  
  &:focus {
    outline: none;
  }
}

.editor-sidebar {
  width: 200px;
  border-left: 1px solid #dcdfe6;
  padding: 10px;
  
  h3 {
    margin: 0 0 10px;
    font-size: 14px;
    color: #606266;
  }
}

.character-list {
  margin-bottom: 20px;
  
  .el-tag {
    margin: 0 5px 5px 0;
  }
}

.editor-footer {
  padding: 5px 10px;
  border-top: 1px solid #dcdfe6;
  display: flex;
  justify-content: space-between;
  color: #909399;
  font-size: 12px;
}

.ai-options {
  margin-bottom: 20px;
}

.ai-loading {
  text-align: center;
  color: #909399;
  
  .el-icon {
    margin-right: 5px;
  }
}

.ai-suggestion {
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
  min-height: 100px;
}
</style> 