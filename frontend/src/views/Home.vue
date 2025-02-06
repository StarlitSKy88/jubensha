<template>
  <div class="home-container">
    <!-- 顶部标题栏 -->
    <div class="header-bar">
      <h2>设置等相关选项</h2>
      <div class="header-actions">
        <el-button type="primary" @click="openSettings">打开设置</el-button>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 第一行 -->
      <div class="content-row">
        <!-- 左侧文档列表 -->
        <div class="left-panel">
          <div class="panel-content">
            <h3>显示文档列表</h3>
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
            />
          </div>
        </div>

        <!-- 中间编辑区域 -->
        <div class="center-panel">
          <div class="panel-content">
            <div class="editor-tabs">
              <el-tabs v-model="activeTab" type="card" closable @tab-remove="removeTab">
                <el-tab-pane
                  v-for="item in editTabs"
                  :key="item.name"
                  :label="item.title"
                  :name="item.name"
                >
                  <div class="editor-area">
                    <div class="editor-info">
                      <p>点击左侧的文件列表和大纲，主持人手册可以显示详细信息。</p>
                      <p>可以在此进行详细修改</p>
                      <p>该模块顶部标签页切换不同的文档</p>
                    </div>
                    <el-input
                      v-model="item.content"
                      type="textarea"
                      :rows="15"
                      :placeholder="'编辑 ' + item.title"
                      @input="handleContentChange(item.name)"
                    />
                  </div>
                </el-tab-pane>
              </el-tabs>
            </div>
          </div>
        </div>

        <!-- 右侧修改历史 -->
        <div class="right-panel">
          <div class="panel-content">
            <h3>修改历史</h3>
            <div class="history-list">
              <el-timeline>
                <el-timeline-item
                  v-for="(history, index) in editHistory"
                  :key="index"
                  :timestamp="history.time"
                  :type="history.type"
                >
                  <p class="history-item" @click="restoreHistory(history)">
                    {{ history.description }}
                  </p>
                </el-timeline-item>
              </el-timeline>
            </div>
            <p class="history-tip">修改历史，可以通过向上翻滚点击历史对话回退到历史修改。</p>
          </div>
        </div>
      </div>

      <!-- 第二行 -->
      <div class="content-row">
        <!-- 左侧手册 -->
        <div class="left-panel">
          <div class="panel-content">
            <h3>显示大纲和主持人手册</h3>
            <el-tabs v-model="manualTab">
              <el-tab-pane label="大纲" name="outline">
                <div class="outline-tree">
                  <el-tree
                    :data="outlineData"
                    :props="defaultProps"
                    @node-click="handleOutlineClick"
                  />
                </div>
              </el-tab-pane>
              <el-tab-pane label="主持人手册" name="manual">
                <div class="manual-content">
                  <!-- 主持人手册内容 -->
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>

        <!-- 中间历史区域 -->
        <div class="center-panel">
          <div class="panel-content">
            <h3>显示当前引用的文档修改历史</h3>
            <div class="reference-actions">
              <el-button @click="importContent">导入内容库</el-button>
              <el-button @click="addHistoryDoc">增加历史文档</el-button>
            </div>
            <div class="reference-list">
              <el-table :data="referenceHistory" height="400">
                <el-table-column prop="time" label="时间" width="180" />
                <el-table-column prop="type" label="类型" width="100" />
                <el-table-column prop="content" label="内容" />
              </el-table>
            </div>
          </div>
        </div>

        <!-- 右侧对话框 -->
        <div class="right-panel">
          <div class="panel-content">
            <div class="dialog-box">
              <div class="dialog-messages" ref="messagesContainer">
                <div v-for="(msg, index) in chatMessages" :key="index" :class="msg.type">
                  {{ msg.content }}
                </div>
              </div>
              <div class="dialog-input">
                <el-input
                  v-model="chatInput"
                  type="textarea"
                  :rows="3"
                  placeholder="输入对话内容，支持@文件名 进行定向修改"
                  @keyup.enter.ctrl="sendMessage"
                />
                <el-button type="primary" @click="sendMessage">发送</el-button>
              </div>
            </div>
            <div class="dialog-tips">
              <p>对话框：</p>
              <p>1, 可以通过对话框进行自然语言对话。通过对话对整个剧本进行修改，ai大模型通过理解用户输出的自然语言进行即时修改。</p>
              <p>2, 可以通过"@+文件名"对指定文件进行修改。也可以"@+文件名: 引用内容"进行针对性的修改。如果不选择引用就分析自然语言对整体进行修改</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

// 搜索
const searchQuery = ref('')
const filterNode = (value: string, data: any) => {
  if (!value) return true
  return data.label.includes(value)
}

// 文档树
const documentTree = ref()
const documentList = ref([
  {
    label: '剧本文档',
    children: [
      { label: '主线剧情', type: 'main' },
      { label: '支线剧情', type: 'side' },
      { label: '角色设定', type: 'character' }
    ]
  }
])

// 编辑标签页
const activeTab = ref('1')
const editTabs = ref([
  { title: '主线剧情', name: '1', content: '' }
])

// 大纲数据
const manualTab = ref('outline')
const outlineData = ref([
  {
    label: '第一章',
    children: [
      { label: '场景1' },
      { label: '场景2' }
    ]
  }
])

// 历史记录
const editHistory = ref([
  { time: '2024-02-09 10:00', type: 'primary', description: '修改了主线剧情' }
])

// 引用历史
const referenceHistory = ref([
  { time: '2024-02-09 10:00', type: '引用', content: '引用了xxx内容' }
])

// 聊天对话
const chatInput = ref('')
const chatMessages = ref([
  { type: 'system', content: '欢迎使用AI助手，请输入您的问题。' }
])
const messagesContainer = ref()

// 方法
const handleNodeClick = (data: any) => {
  // 处理文档树节点点击
  const newTab = {
    title: data.label,
    name: String(editTabs.value.length + 1),
    content: ''
  }
  editTabs.value.push(newTab)
  activeTab.value = newTab.name
}

const handleOutlineClick = (data: any) => {
  // 处理大纲点击
  console.log('大纲点击:', data)
}

const removeTab = (targetName: string) => {
  // 移除标签页
  const tabs = editTabs.value
  let activeName = activeTab.value
  if (activeName === targetName) {
    tabs.forEach((tab, index) => {
      if (tab.name === targetName) {
        const nextTab = tabs[index + 1] || tabs[index - 1]
        if (nextTab) {
          activeName = nextTab.name
        }
      }
    })
  }
  activeTab.value = activeName
  editTabs.value = tabs.filter(tab => tab.name !== targetName)
}

const handleContentChange = (tabName: string) => {
  // 处理内容变化
  editHistory.value.unshift({
    time: new Date().toLocaleString(),
    type: 'primary',
    description: `修改了 ${editTabs.value.find(tab => tab.name === tabName)?.title}`
  })
}

const restoreHistory = (history: any) => {
  // 还原历史版本
  console.log('还原到:', history)
}

const importContent = () => {
  // 导入内容
  console.log('导入内容')
}

const addHistoryDoc = () => {
  // 添加历史文档
  console.log('添加历史文档')
}

const sendMessage = () => {
  if (!chatInput.value.trim()) return
  
  // 添加用户消息
  chatMessages.value.push({
    type: 'user',
    content: chatInput.value
  })
  
  // 模拟AI响应
  setTimeout(() => {
    chatMessages.value.push({
      type: 'ai',
      content: '收到您的消息：' + chatInput.value
    })
    chatInput.value = ''
    
    // 滚动到底部
    nextTick(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    })
  }, 500)
}

// 监听搜索词变化
watch(searchQuery, (val) => {
  documentTree.value?.filter(val)
})
</script>

<style scoped>
.home-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f0f2f5;
}

.header-bar {
  padding: 10px 20px;
  background-color: #e6e6e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-bar h2 {
  margin: 0;
  color: #333;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 10px;
  gap: 10px;
  overflow: hidden;
}

.content-row {
  display: flex;
  gap: 10px;
  flex: 1;
  min-height: 0;
}

.left-panel, .right-panel {
  width: 300px;
  background-color: #fff;
  border: 1px solid #ddd;
  display: flex;
  flex-direction: column;
}

.center-panel {
  flex: 1;
  background-color: #fff;
  border: 1px solid #ddd;
  display: flex;
  flex-direction: column;
}

.panel-content {
  padding: 15px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.search-box {
  margin-bottom: 10px;
}

.editor-area {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.editor-info {
  margin-bottom: 10px;
}

.history-list {
  flex: 1;
  overflow-y: auto;
}

.history-item {
  cursor: pointer;
}

.history-item:hover {
  color: #409EFF;
}

.dialog-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
}

.dialog-messages {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 4px;
  margin-bottom: 10px;
}

.dialog-input {
  display: flex;
  gap: 10px;
}

.user {
  text-align: right;
  margin: 5px 0;
  color: #409EFF;
}

.ai {
  text-align: left;
  margin: 5px 0;
  color: #67C23A;
}

.system {
  text-align: center;
  margin: 5px 0;
  color: #909399;
}

.reference-actions {
  margin-bottom: 10px;
}

.reference-list {
  flex: 1;
  overflow: hidden;
}

.outline-tree, .manual-content {
  height: 100%;
  overflow-y: auto;
}
</style> 