import { Configuration, OpenAIApi } from 'openai';
import { openaiConfig } from '../../config/openai.config';
import { ChatService } from './chat.service';
import { BertService } from './bert.service';
import { KnowledgeService } from '../rag/knowledge.service';
import { RedisClient } from '../../utils/redis';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface Session {
  id: string;
  userId: string;
  context: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export class AIService {
  private openai: OpenAIApi;
  private chatService: ChatService;
  private bertService: BertService;
  private knowledgeService: KnowledgeService;
  private redisClient: RedisClient;

  constructor() {
    const configuration = new Configuration({
      apiKey: openaiConfig.apiKey
    });
    this.openai = new OpenAIApi(configuration);
    this.chatService = new ChatService();
    this.bertService = new BertService();
    this.knowledgeService = new KnowledgeService();
    this.redisClient = new RedisClient();
  }

  // 创建会话
  async createSession(userId: string, context: string): Promise<Session> {
    const session: Session = {
      id: this.generateSessionId(),
      userId,
      context,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await this.saveSession(session);
    return session;
  }

  // 发送消息
  async sendMessage(sessionId: string, message: string): Promise<Message> {
    // 获取会话
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // 创建用户消息
    const userMessage: Message = {
      role: 'user',
      content: message,
      timestamp: Date.now()
    };

    // 添加到会话历史
    session.messages.push(userMessage);

    // 获取AI回复
    const response = await this.chatService.handleMessage(message, {
      sessionId,
      userId: session.userId,
      history: session.messages.map(m => ({
        role: m.role,
        content: m.content
      }))
    });

    // 创建AI消息
    const aiMessage: Message = {
      role: 'assistant',
      content: response,
      timestamp: Date.now()
    };

    // 添加到会话历史
    session.messages.push(aiMessage);
    session.updatedAt = Date.now();

    // 保存会话
    await this.saveSession(session);

    return aiMessage;
  }

  // 生成内容
  async generateContent(prompt: string, options: {
    type: 'story' | 'character' | 'clue' | 'plot';
    temperature?: number;
    maxTokens?: number;
  }): Promise<string> {
    try {
      // 根据内容类型设置系统提示
      const systemPrompt = this.getSystemPrompt(options.type);

      const response = await this.openai.createChatCompletion({
        model: openaiConfig.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 1000,
        top_p: 1,
        frequency_penalty: 0.2,
        presence_penalty: 0.2
      });

      return response.data.choices[0].message?.content || '生成内容失败';
    } catch (error) {
      console.error('Failed to generate content:', error);
      throw new Error('Failed to generate content');
    }
  }

  // 分析文本
  async analyzeText(text: string, options: {
    type: 'sentiment' | 'keywords' | 'summary' | 'topics';
  }): Promise<any> {
    try {
      // 根据分析类型设置提示
      const prompt = this.getAnalysisPrompt(options.type, text);

      const response = await this.openai.createChatCompletion({
        model: openaiConfig.model,
        messages: [
          { role: 'system', content: '你是一个专业的文本分析助手' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 500,
        top_p: 1
      });

      const result = response.data.choices[0].message?.content;
      if (!result) {
        throw new Error('Analysis failed');
      }

      return this.parseAnalysisResult(options.type, result);
    } catch (error) {
      console.error('Failed to analyze text:', error);
      throw new Error('Failed to analyze text');
    }
  }

  // 获取会话历史
  async getSessionHistory(sessionId: string): Promise<Message[]> {
    const session = await this.getSession(sessionId);
    return session?.messages || [];
  }

  // 清除会话历史
  async clearSessionHistory(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (session) {
      session.messages = [];
      session.updatedAt = Date.now();
      await this.saveSession(session);
    }
  }

  // 私有方法

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private async saveSession(session: Session): Promise<void> {
    await this.redisClient.set(
      `session:${session.id}`,
      JSON.stringify(session),
      'EX',
      24 * 60 * 60 // 24小时过期
    );
  }

  private async getSession(sessionId: string): Promise<Session | null> {
    const data = await this.redisClient.get(`session:${sessionId}`);
    return data ? JSON.parse(data) : null;
  }

  private getSystemPrompt(type: string): string {
    const prompts: Record<string, string> = {
      story: '你是一个专业的剧本杀编剧,擅长创作引人入胜的故事',
      character: '你是一个专业的角色设定师,擅长创造丰富立体的人物',
      clue: '你是一个专业的线索设计师,擅长设计巧妙的线索和谜题',
      plot: '你是一个专业的剧情策划,擅长设计紧凑的剧情结构'
    };
    return prompts[type] || '你是一个专业的AI助手';
  }

  private getAnalysisPrompt(type: string, text: string): string {
    const prompts: Record<string, string> = {
      sentiment: `请分析以下文本的情感倾向,包括主要情绪、情感强度和具体表现:

${text}

请按以下格式输出:
主要情绪:
情感强度: (1-5)
具体表现:`,
      keywords: `请从以下文本中提取关键词和关键短语:

${text}

请按重要性排序,并说明出现频率`,
      summary: `请对以下文本进行摘要:

${text}

要求:
1. 保留主要信息
2. 突出关键点
3. 语言简洁
4. 长度控制在200字以内`,
      topics: `请分析以下文本的主题:

${text}

要求:
1. 列出主要主题
2. 说明主题之间的关系
3. 分析主题的重要性`
    };
    return prompts[type] || `请分析以下文本:\n\n${text}`;
  }

  private parseAnalysisResult(type: string, result: string): any {
    switch (type) {
      case 'sentiment':
        // 解析情感分析结果
        const sentiment = {
          emotion: '',
          intensity: 0,
          details: ''
        };
        const lines = result.split('\n');
        lines.forEach(line => {
          if (line.startsWith('主要情绪:')) {
            sentiment.emotion = line.split(':')[1].trim();
          } else if (line.startsWith('情感强度:')) {
            sentiment.intensity = parseInt(line.split(':')[1].trim());
          } else if (line.startsWith('具体表现:')) {
            sentiment.details = line.split(':')[1].trim();
          }
        });
        return sentiment;

      case 'keywords':
        // 解析关键词结果
        return result.split('\n')
          .filter(line => line.trim())
          .map(line => {
            const [keyword, frequency] = line.split(':').map(s => s.trim());
            return { keyword, frequency: parseInt(frequency) || 1 };
          });

      case 'summary':
        // 返回摘要文本
        return result.trim();

      case 'topics':
        // 解析主题分析结果
        const topics: any[] = [];
        let currentTopic: any = null;
        result.split('\n').forEach(line => {
          if (line.startsWith('- ')) {
            if (currentTopic) {
              topics.push(currentTopic);
            }
            currentTopic = {
              name: line.substring(2).trim(),
              details: []
            };
          } else if (currentTopic && line.trim()) {
            currentTopic.details.push(line.trim());
          }
        });
        if (currentTopic) {
          topics.push(currentTopic);
        }
        return topics;

      default:
        return result;
    }
  }
} 