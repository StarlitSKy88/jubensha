import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  Message,
  DialogueContext,
  DialogueState,
  DialogueSettings,
  EditRequest,
  FileReference
} from '../types/dialogue.types';

export const useDialogueStore = defineStore('dialogue', () => {
  // 状态定义
  const messages = ref<Message[]>([]);
  const context = ref<DialogueContext>({
    editHistory: [],
    messageHistory: []
  });
  const isLoading = ref(false);
  const error = ref<string | undefined>();
  const settings = ref<DialogueSettings>({
    autoScroll: true,
    showTimestamp: true,
    enablePreview: true,
    confirmEdit: true
  });

  // 计算属性
  const lastMessage = computed(() => 
    messages.value[messages.value.length - 1]
  );

  const pendingMessages = computed(() => 
    messages.value.filter(msg => msg.status === 'sending')
  );

  const hasError = computed(() => !!error.value);

  // 方法
  function addMessage(message: Message) {
    messages.value.push(message);
    context.value.messageHistory.push(message);
  }

  function updateMessage(id: string, updates: Partial<Message>) {
    const index = messages.value.findIndex(msg => msg.id === id);
    if (index !== -1) {
      messages.value[index] = { ...messages.value[index], ...updates };
    }
  }

  function setCurrentFile(file: FileReference | undefined) {
    context.value.currentFile = file;
  }

  function addEditHistory(edit: EditRequest) {
    context.value.editHistory.push(edit);
  }

  function setLoading(value: boolean) {
    isLoading.value = value;
  }

  function setError(message: string | undefined) {
    error.value = message;
  }

  function updateSettings(updates: Partial<DialogueSettings>) {
    settings.value = { ...settings.value, ...updates };
  }

  function clearMessages() {
    messages.value = [];
  }

  function clearContext() {
    context.value = {
      editHistory: [],
      messageHistory: []
    };
  }

  function reset() {
    clearMessages();
    clearContext();
    error.value = undefined;
    isLoading.value = false;
  }

  // 导出状态和方法
  return {
    // 状态
    messages,
    context,
    isLoading,
    error,
    settings,

    // 计算属性
    lastMessage,
    pendingMessages,
    hasError,

    // 方法
    addMessage,
    updateMessage,
    setCurrentFile,
    addEditHistory,
    setLoading,
    setError,
    updateSettings,
    clearMessages,
    clearContext,
    reset
  };
}); 