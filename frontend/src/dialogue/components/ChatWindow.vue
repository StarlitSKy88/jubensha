<template>
  <div class="chat-window">
    <!-- 消息列表 -->
    <div class="message-list" ref="messageList">
      <div
        v-for="message in messages"
        :key="message.id"
        :class="['message', message.role]"
      >
        <!-- 消息头部 -->
        <div class="message-header">
          <span class="role">{{ getRoleName(message.role) }}</span>
          <span v-if="settings.showTimestamp" class="timestamp">
            {{ formatTime(message.timestamp) }}
          </span>
        </div>

        <!-- 消息内容 -->
        <div class="message-content">
          {{ message.content }}
        </div>

        <!-- 文件引用 -->
        <div v-if="message.references?.length" class="references">
          <div
            v-for="ref in message.references"
            :key="ref.fileId"
            class="reference"
          >
            <el-icon><Document /></el-icon>
            <span>{{ ref.fileName }}</span>
          </div>
        </div>

        <!-- 消息状态 -->
        <div class="message-status">
          <el-tag
            v-if="message.status === 'sending'"
            size="small"
            type="info"
          >
            发送中...
          </el-tag>
          <el-tag
            v-else-if="message.status === 'failed'"
            size="small"
            type="danger"
          >
            发送失败
          </el-tag>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-area">
      <!-- 文件引用按钮 -->
      <el-button
        class="reference-btn"
        icon="Plus"
        @click="handleReferenceClick"
      >
        引用文件
      </el-button>

      <!-- 消息输入框 -->
      <el-input
        v-model="inputContent"
        type="textarea"
        :rows="3"
        placeholder="输入消息..."
        @keydown.enter.exact.prevent="handleSend"
      />

      <!-- 发送按钮 -->
      <el-button
        type="primary"
        :loading="isLoading"
        @click="handleSend"
      >
        发送
      </el-button>
    </div>

    <!-- 文件选择对话框 -->
    <el-dialog
      v-model="showFileDialog"
      title="选择文件"
      width="50%"
    >
      <div class="file-list">
        <!-- 文件列表内容 -->
      </div>
      <template #footer>
        <el-button @click="showFileDialog = false">取消</el-button>
        <el-button type="primary" @click="handleFileSelect">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { Document } from '@element-plus/icons-vue';
import { useDialogueStore } from '../store/dialogue.store';
import { dialogueService } from '../services/dialogue.service';
import type { Message, FileReference } from '../types/dialogue.types';

// 状态管理
const store = useDialogueStore();
const { messages, isLoading, settings } = storeToRefs(store);

// 本地状态
const messageList = ref<HTMLElement | null>(null);
const inputContent = ref('');
const showFileDialog = ref(false);

// 方法
const getRoleName = (role: string) => {
  const roleMap = {
    user: '用户',
    assistant: 'AI助手',
    system: '系统'
  };
  return roleMap[role] || role;
};

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString();
};

const scrollToBottom = () => {
  if (messageList.value && settings.value.autoScroll) {
    setTimeout(() => {
      messageList.value!.scrollTop = messageList.value!.scrollHeight;
    }, 100);
  }
};

const handleSend = async () => {
  if (!inputContent.value.trim() || isLoading.value) return;

  try {
    await dialogueService.sendMessage(inputContent.value);
    inputContent.value = '';
  } catch (error) {
    // 错误已在service中处理
  }
};

const handleReferenceClick = () => {
  showFileDialog.value = true;
};

const handleFileSelect = async () => {
  // TODO: 实现文件选择逻辑
  showFileDialog.value = false;
};

// 监听消息变化，自动滚动
watch(messages, () => {
  scrollToBottom();
});

// 组件挂载时滚动到底部
onMounted(() => {
  scrollToBottom();
});
</script>

<style scoped>
.chat-window {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--el-bg-color);
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.message {
  margin-bottom: 20px;
  max-width: 80%;
}

.message.assistant {
  margin-left: auto;
  background: var(--el-color-primary-light-9);
  border-radius: 10px 10px 0 10px;
}

.message.user {
  margin-right: auto;
  background: var(--el-color-info-light-9);
  border-radius: 10px 10px 10px 0;
}

.message-header {
  display: flex;
  justify-content: space-between;
  padding: 5px 10px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.message-content {
  padding: 10px;
  word-break: break-word;
}

.references {
  padding: 5px 10px;
  background: var(--el-color-info-light-9);
  border-top: 1px solid var(--el-border-color-lighter);
}

.reference {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--el-color-primary);
}

.message-status {
  padding: 0 10px 5px;
  text-align: right;
}

.input-area {
  display: flex;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.reference-btn {
  align-self: flex-start;
}

.el-input {
  flex: 1;
}
</style> 