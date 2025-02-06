import { ChatOpenAI } from '@langchain/openai';
import { BufferMemory } from 'langchain/memory';
import { config } from '@config';
import { logger } from '@utils/logger';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  message: ChatMessage;
  suggestions?: string[];
}

export class ChatService {
  private llm: ChatOpenAI;
  private memory: BufferMemory;

  constructor() {
    // 初始化LLM
    this.llm = new ChatOpenAI({
      modelName: config.openai.models.chat,
      temperature: 0.7,
      maxTokens: 2000
    });

    // 初始化记忆
    this.memory = new BufferMemory({
      memoryKey: 'chat_history',
      returnMessages: true,
      outputKey: 'output'
    });
  }

  /**
   * 发送消息
   */
  async sendMessage(message: string, context?: {
    systemPrompt?: string;
    previousMessages?: ChatMessage[];
  }): Promise<ChatResponse> {
    try {
      // 准备上下文
      let prompt = '';
      if (context?.systemPrompt) {
        prompt += `System: ${context.systemPrompt}\n\n`;
      }
      if (context?.previousMessages) {
        prompt += context.previousMessages
          .map(msg => `${msg.role}: ${msg.content}`)
          .join('\n');
      }
      prompt += `\nUser: ${message}\n\nAssistant:`;

      // 调用LLM
      const response = await this.llm.call(prompt);

      // 保存到记忆
      await this.memory.saveContext(
        { input: message },
        { output: response }
      );

      // 解析响应
      const chatMessage: ChatMessage = {
        role: 'assistant',
        content: response
      };

      logger.info('AI响应成功', {
        messageLength: message.length,
        responseLength: response.length
      });

      return {
        message: chatMessage
      };
    } catch (error) {
      logger.error('AI响应失败', error);
      throw error;
    }
  }

  /**
   * 获取历史记录
   */
  async getHistory(): Promise<ChatMessage[]> {
    try {
      const history = await this.memory.loadMemoryVariables({});
      return history.messages || [];
    } catch (error) {
      logger.error('获取历史记录失败', error);
      throw error;
    }
  }

  /**
   * 清除历史记录
   */
  async clearHistory(): Promise<void> {
    try {
      await this.memory.clear();
      logger.info('历史记录已清除');
    } catch (error) {
      logger.error('清除历史记录失败', error);
      throw error;
    }
  }
} 