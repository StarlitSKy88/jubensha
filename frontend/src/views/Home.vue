<template>
  <div class="home">
    <!-- 左侧面板 -->
    <div class="left-panel">
      <!-- 文档列表 -->
      <div class="panel-section">
        <div class="section-header">
          <h2>显示文档列表</h2>
        </div>
        <div class="section-content">
          <div class="search-box">
            <el-input
              v-model="searchQuery"
              placeholder="搜索文档..."
              prefix-icon="Search"
            />
          </div>
          <el-tree
            ref="documentTree"
            :data="documentList"
            :props="defaultProps"
            :filter-node-method="filterNode"
            @node-click="handleNodeClick"
            highlight-current
            v-loading="isLoading"
          />
        </div>
      </div>
      
      <!-- 大纲和主持人手册 -->
      <div class="panel-section">
        <div class="section-header">
          <h2>显示大纲和主持人手册</h2>
        </div>
        <div class="section-content">
          <el-tabs v-model="manualTab">
            <el-tab-pane label="大纲" name="outline">
              <el-tree
                :data="outlineData"
                :props="defaultProps"
                @node-click="handleOutlineClick"
                v-loading="isLoading"
              />
            </el-tab-pane>
            <el-tab-pane label="主持人手册" name="manual">
              <div class="manual-content">
                <!-- 主持人手册内容 -->
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>

    <!-- 中间内容区 -->
    <div class="center-panel">
      <!-- 编辑区域 -->
      <div class="panel-section">
        <div class="section-header">
          <div class="header-info">
            <p>点击左侧的文件列表和大纲，主持人手册可以显示详细信息。</p>
            <p>可以在此进行详细修改</p>
            <p>该模块顶部标签来切换不同的文档</p>
          </div>
        </div>
        <div class="section-content">
          <el-tabs 
            v-model="activeTab" 
            type="card" 
            closable 
            @tab-remove="removeTab"
            v-loading="isLoading"
          >
            <el-tab-pane
              v-for="item in editTabs"
              :key="item.id"
              :label="item.title"
              :name="item.id"
            >
              <div class="editor-area">
                <el-input
                  v-model="item.content"
                  type="textarea"
                  :rows="15"
                  :placeholder="'编辑 ' + item.title"
                  @input="(val) => handleContentChange(item.id, val)"
                />
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>

      <!-- 引用历史 -->
      <div class="panel-section">
        <div class="section-header">
          <h2>显示当前引用的文档修改历史</h2>
          <div class="section-actions">
            <el-button @click="importContent">导入内容库</el-button>
            <el-button @click="addHistoryDoc">增加历史文档</el-button>
          </div>
        </div>
        <div class="section-content">
          <el-table 
            :data="referenceHistory" 
            height="200"
            v-loading="isLoading"
          >
            <el-table-column prop="time" label="时间" width="180" />
            <el-table-column prop="type" label="类型" width="100" />
            <el-table-column prop="content" label="内容" />
          </el-table>
        </div>
      </div>
    </div>

    <!-- 右侧面板 -->
    <div class="right-panel">
      <!-- 修改历史 -->
      <div class="panel-section">
        <div class="section-header">
          <h2>修改历史</h2>
        </div>
        <div class="section-content">
          <el-timeline v-loading="isLoading">
            <el-timeline-item
              v-for="(history, index) in editHistory"
              :key="index"
              :timestamp="history.timestamp"
              :type="history.type"
            >
              <p class="history-item" @click="restoreHistory(history)">
                {{ history.description }}
              </p>
            </el-timeline-item>
          </el-timeline>
          <p class="history-tip">修改历史，可以通过向上翻滚点击历史对话回退历史修改。</p>
        </div>
      </div>

      <!-- 对话框 -->
      <div class="panel-section">
        <div class="section-content">
          <div class="chat-container">
            <div 
              class="chat-messages" 
              ref="messagesContainer"
              v-loading="isLoading"
            >
              <div 
                v-for="msg in chatMessages" 
                :key="msg.id" 
                :class="msg.type"
              >
                {{ msg.content }}
              </div>
            </div>
            <div class="chat-input">
              <el-input
                v-model="chatStore.chatInput"
                type="textarea"
                :rows="3"
                placeholder="输入对话内容，支持@文件名 进行定向修改"
                @keyup.enter.ctrl="sendMessage"
                :disabled="isLoading"
              />
              <el-button 
                type="primary" 
                @click="sendMessage"
                :loading="isLoading"
              >
                发送
              </el-button>
            </div>
          </div>
          <div class="chat-tips">
            <p>对话框：</p>
            <p>1, 可以通过对话进行自然语言对话。通过对话对整个剧本进行修改，ai大模型通过理解用户输出的自然语言进行即时修改。</p>
            <p>2, 可以通过"@+文件名"对指定文件进行修改。也可以"@+文件名: 引用内容"进行针对性的修改。如果不选择引用就分析自然语言对整体进行修改</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, nextTick, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useDocumentStore } from '@/stores/document'
import { useChatStore } from '@/stores/chat'

const route = useRoute()
const documentStore = useDocumentStore()
const chatStore = useChatStore()

// 搜索
const searchQuery = ref('')
const filterNode = (value: string, data: any) => {
  if (!value) return true
  return data.label.includes(value)
}

// 文档树
const documentTree = ref()

// 大纲数据
const manualTab = ref('outline')
const outlineData = computed(() => 
  documentStore.currentDocument?.outline || []
)

// 编辑标签页
const activeTab = ref('')
const editTabs = ref<Array<{
  id: string
  title: string
  content: string
}>>([])

// 加载项目文档
onMounted(async () => {
  const projectId = route.params.projectId as string
  if (projectId) {
    await documentStore.fetchDocuments(projectId)
  }
})

// 方法
const handleNodeClick = async (data: any) => {
  if (!data.id) return
  
  const doc = await documentStore.fetchDocument(data.id)
  if (doc) {
    const existingTab = editTabs.value.find(tab => tab.id === doc.id)
    if (!existingTab) {
      editTabs.value.push({
        id: doc.id,
        title: doc.title,
        content: doc.content
      })
    }
    activeTab.value = doc.id
    
    // 加载文档历史和引用
    documentStore.fetchDocumentHistory(doc.id)
    documentStore.fetchDocumentReferences(doc.id)
    
    // 加载相关的聊天历史
    chatStore.loadChatHistory(doc.id)
  }
}

const handleOutlineClick = (data: any) => {
  // TODO: 跳转到对应的内容位置
  console.log('大纲点击:', data)
}

const removeTab = (targetId: string) => {
  const tabs = editTabs.value
  let activeId = activeTab.value
  if (activeId === targetId) {
    tabs.forEach((tab, index) => {
      if (tab.id === targetId) {
        const nextTab = tabs[index + 1] || tabs[index - 1]
        if (nextTab) {
          activeId = nextTab.id
        }
      }
    })
  }
  activeTab.value = activeId
  editTabs.value = tabs.filter(tab => tab.id !== targetId)
  
  // 停止自动保存
  documentStore.stopAutoSave()
}

const handleContentChange = (tabId: string, content: string) => {
  const tab = editTabs.value.find(t => t.id === tabId)
  if (tab) {
    tab.content = content
    // 启动自动保存
    documentStore.startAutoSave(tabId, content)
  }
}

const restoreHistory = async (history: any) => {
  if (documentStore.currentDocument) {
    await documentStore.restoreDocumentVersion(
      documentStore.currentDocument.id,
      history.id
    )
  }
}

const importContent = () => {
  // TODO: 实现导入内容库功能
  console.log('导入内容')
}

const addHistoryDoc = () => {
  // TODO: 实现添加历史文档功能
  console.log('添加历史文档')
}

const sendMessage = async () => {
  if (!chatStore.chatInput.trim()) return
  
  // 获取当前文档上下文
  const metadata = documentStore.currentDocument 
    ? {
        documentId: documentStore.currentDocument.id,
        selection: getSelection()
      }
    : undefined
  
  await chatStore.sendMessage(chatStore.chatInput, metadata)
  
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// 获取选中的文本
const getSelection = () => {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return undefined
  
  const range = selection.getRangeAt(0)
  return {
    start: range.startOffset,
    end: range.endOffset,
    text: range.toString()
  }
}

// 监听搜索词变化
watch(searchQuery, (val) => {
  documentTree.value?.filter(val)
})

// 计算属性
const documentList = computed(() => documentStore.documentTree)
const editHistory = computed(() => documentStore.documentHistory)
const referenceHistory = computed(() => documentStore.documentReferences)
const chatMessages = computed(() => chatStore.messages)
const isLoading = computed(() => 
  documentStore.isLoading || chatStore.isLoading
)

const messagesContainer = ref()
</script>

<style lang="scss" scoped>
.home {
  display: flex;
  height: 100vh;
  background-color: var(--color-bg-secondary);
}

.left-panel, .right-panel {
  flex: 0 0 280px;
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-primary);
  border-right: 1px solid var(--color-border);
}

.right-panel {
  border-right: none;
  border-left: 1px solid var(--color-border);
}

.center-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.panel-section {
  display: flex;
  flex-direction: column;
  flex: 1;
  border-bottom: 1px solid var(--color-border);

  &:last-child {
    border-bottom: none;
  }
}

.section-header {
  padding: 16px;
  border-bottom: 1px solid var(--color-border);

  h2 {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0;
  }

  .header-info {
    p {
      font-size: 14px;
      color: var(--color-text-secondary);
      margin: 0 0 8px;
      line-height: 1.5;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

.section-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;

  p {
    font-size: 14px;
    color: var(--color-text-secondary);
    margin: 0 0 8px;
    line-height: 1.5;
  }
}

.section-actions {
  margin-top: 8px;
  display: flex;
  gap: 8px;
}

.search-box {
  margin-bottom: 16px;
}

.editor-area {
  height: 100%;
}

.history-item {
  cursor: pointer;
  &:hover {
    color: var(--color-primary);
  }
}

.history-tip {
  text-align: center;
  margin-top: 16px;
  color: var(--color-text-secondary);
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 300px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: var(--color-bg-secondary);
  border-radius: 4px;
  margin-bottom: 16px;

  .system {
    text-align: center;
    color: var(--color-text-secondary);
    margin: 8px 0;
  }

  .user {
    text-align: right;
    color: var(--color-primary);
    margin: 8px 0;
  }

  .ai {
    text-align: left;
    color: var(--color-success);
    margin: 8px 0;
  }
}

.chat-input {
  display: flex;
  gap: 8px;
}

.chat-tips {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
}

// 滚动条样式
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background-color: var(--color-bg-secondary);
}

::-webkit-scrollbar-thumb {
  background-color: var(--color-border);
  border-radius: 4px;

  &:hover {
    background-color: var(--color-text-placeholder);
  }
}
</style> 