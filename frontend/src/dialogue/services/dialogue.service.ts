import type {
  Message,
  DialogueResponse,
  EditRequest,
  EditResult,
  FileReference,
  DialogueServiceConfig
} from '../types/dialogue.types';
import { useDialogueStore } from '../store/dialogue.store';
import { v4 as uuidv4 } from 'uuid';

export class DialogueService {
  private config: DialogueServiceConfig;
  private store = useDialogueStore();

  constructor(config: DialogueServiceConfig) {
    this.config = {
      timeout: 30000,
      retryCount: 3,
      batchSize: 20,
      ...config
    };
  }

  /**
   * 发送消息
   */
  async sendMessage(content: string): Promise<DialogueResponse> {
    try {
      this.store.setLoading(true);
      
      // 创建消息对象
      const message: Message = {
        id: uuidv4(),
        role: 'user',
        content,
        timestamp: Date.now(),
        status: 'sending'
      };

      // 添加到状态
      this.store.addMessage(message);

      // 发送请求
      const response = await fetch(this.config.apiEndpoint + '/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: content,
          context: this.store.context
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      // 更新消息状态
      this.store.updateMessage(message.id, { status: 'sent' });

      // 处理响应
      const data: DialogueResponse = await response.json();
      
      // 添加AI响应
      const aiMessage: Message = {
        id: data.messageId,
        role: 'assistant',
        content: data.content,
        timestamp: Date.now(),
        status: 'sent'
      };

      this.store.addMessage(aiMessage);

      return data;
    } catch (error) {
      // 更新消息状态为失败
      this.store.updateMessage(message.id, { status: 'failed' });
      
      // 设置错误状态
      this.store.setError(error.message);
      
      throw error;
    } finally {
      this.store.setLoading(false);
    }
  }

  /**
   * 引用文件
   */
  async referenceFile(fileId: string): Promise<FileReference> {
    try {
      const response = await fetch(this.config.apiEndpoint + `/files/${fileId}`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error('Failed to reference file');
      }

      const file: FileReference = await response.json();
      this.store.setCurrentFile(file);

      return file;
    } catch (error) {
      this.store.setError(error.message);
      throw error;
    }
  }

  /**
   * 应用编辑
   */
  async applyEdit(edit: EditRequest): Promise<EditResult> {
    try {
      this.store.setLoading(true);

      const response = await fetch(this.config.apiEndpoint + '/edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(edit)
      });

      if (!response.ok) {
        throw new Error('Failed to apply edit');
      }

      const result: EditResult = await response.json();
      
      if (result.success) {
        this.store.addEditHistory(edit);
      }

      return result;
    } catch (error) {
      this.store.setError(error.message);
      throw error;
    } finally {
      this.store.setLoading(false);
    }
  }

  /**
   * 获取历史记录
   */
  async getHistory(): Promise<Message[]> {
    try {
      const response = await fetch(this.config.apiEndpoint + '/history', {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error('Failed to get history');
      }

      const messages: Message[] = await response.json();
      return messages;
    } catch (error) {
      this.store.setError(error.message);
      throw error;
    }
  }

  /**
   * 清理对话
   */
  clearDialogue(): void {
    this.store.reset();
  }
}

// 导出服务实例
export const dialogueService = new DialogueService({
  apiEndpoint: import.meta.env.VITE_API_ENDPOINT + '/dialogue'
}); 