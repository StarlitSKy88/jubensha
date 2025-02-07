import { OpenAI } from 'openai';
import { Redis } from '@utils/redis';
import { logger } from '@utils/logger';
import { config } from '@config/index';
import { Message, Session, IMessage, ISession, MessageType, MessageRole, MessageStatus, SessionStatus } from '../models/chat.model';
import * as errors from '../errors/chat.error';
import { RAGService } from '@modules/rag/services/rag.service';

export class ChatService {
  private openai: OpenAI;
  private redis: Redis;
  private ragService: RAGService;
  private readonly messageLimit = 50;  // 每个会话的最大消息数
  private readonly sessionLimit = 10;   // 每个项目的最大会话数
  private readonly rateLimitWindow = 60;  // 速率限制窗口(秒)
  private readonly rateLimitMax = 20;     // 速率限制最大请求数

  constructor() {
    this.openai = new OpenAI({
      apiKey: config.openai.apiKey
    });
    this.redis = new Redis();
    this.ragService = new RAGService();
  }

  async createSession(data: {
    title: string;
    projectId: string;
    createdBy: string;
    context?: Record<string, any>;
  }): Promise<ISession> {
    const sessionCount = await Session.countDocuments({
      projectId: data.projectId,
      status: { $ne: SessionStatus.DELETED }
    });

    if (sessionCount >= this.sessionLimit) {
      throw new errors.SessionLimitExceededError();
    }

    const session = new Session({
      title: data.title,
      projectId: data.projectId,
      createdBy: data.createdBy,
      metadata: {
        messageCount: 0,
        lastMessageAt: new Date(),
        context: data.context
      }
    });

    await session.save();
    return session;
  }

  async sendMessage(data: {
    sessionId: string;
    content: string;
    type: MessageType;
    createdBy: string;
    context?: {
      scriptId?: string;
      characterId?: string;
      clueId?: string;
      selection?: {
        start: number;
        end: number;
        text: string;
      };
    };
  }): Promise<IMessage> {
    const session = await Session.findById(data.sessionId);
    if (!session) {
      throw new errors.SessionNotFoundError(data.sessionId);
    }

    if (session.status !== SessionStatus.ACTIVE) {
      throw new errors.InvalidSessionStatusError(session.status);
    }

    // 检查消息数量限制
    const messageCount = await Message.countDocuments({ sessionId: data.sessionId });
    if (messageCount >= this.messageLimit) {
      throw new errors.MessageLimitExceededError();
    }

    // 创建用户消息
    const userMessage = new Message({
      role: MessageRole.USER,
      type: data.type,
      content: data.content,
      status: MessageStatus.COMPLETED,
      metadata: {
        tokens: 0,
        context: data.context
      },
      sessionId: data.sessionId,
      projectId: session.projectId,
      createdBy: data.createdBy
    });

    await userMessage.save();

    // 更新会话信息
    session.metadata.messageCount += 1;
    session.metadata.lastMessageAt = new Date();
    await session.save();

    // 创建助手消息
    const assistantMessage = new Message({
      role: MessageRole.ASSISTANT,
      type: data.type,
      content: '',
      status: MessageStatus.PROCESSING,
      metadata: {
        tokens: 0
      },
      sessionId: data.sessionId,
      projectId: session.projectId,
      createdBy: data.createdBy
    });

    await assistantMessage.save();

    try {
      const contextMessages = await this.getContextMessages(data.sessionId);
      let response;

      switch (data.type) {
        case MessageType.SCRIPT_EDIT:
          response = await this.handleScriptEdit(contextMessages, data.context);
          break;
        case MessageType.CHARACTER_DESIGN:
          response = await this.handleCharacterDesign(contextMessages, data.context);
          break;
        case MessageType.PLOT_SUGGESTION:
          response = await this.handlePlotSuggestion(contextMessages, data.context);
          break;
        case MessageType.CLUE_DESIGN:
          response = await this.handleClueDesign(contextMessages, data.context);
          break;
        default:
          response = await this.handleGeneralMessage(contextMessages);
      }

      assistantMessage.content = response.content;
      assistantMessage.status = MessageStatus.COMPLETED;
      assistantMessage.metadata = {
        tokens: response.tokens,
        processingTime: Date.now() - assistantMessage.createdAt.getTime()
      };

      await assistantMessage.save();
      return assistantMessage;

    } catch (error) {
      await this.handleError(assistantMessage, error);
      throw error;
    }
  }

  private async handleError(message: IMessage, error: any): Promise<void> {
    message.status = MessageStatus.FAILED;
    message.metadata = {
      tokens: 0,
      error: error.message
    };
    await message.save();
  }

  private async getContextMessages(sessionId: string): Promise<Array<{role: string; content: string}>> {
    const messages = await Message.find({
      sessionId,
      status: MessageStatus.COMPLETED
    })
    .sort({ createdAt: -1 })
    .limit(10);

    return messages.reverse().map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  }

  private async handleScriptEdit(
    contextMessages: Array<{role: string; content: string}>,
    context?: {
      scriptId?: string;
      selection?: {
        text: string;
      };
    }
  ) {
    // 构建系统提示词
    const systemPrompt = `你是一个专业的剧本编辑助手。请根据用户的需求，提供专业的剧本修改建议。
注意以下几点：
1. 保持剧情的连贯性和合理性
2. 注意人物性格的一致性
3. 关注情节节奏的把控
4. 确保对白自然流畅
5. 提供具体的修改建议`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...contextMessages
    ];

    if (context?.selection?.text) {
      messages.push({
        role: 'system',
        content: `当前选中的文本内容：\n${context.selection.text}`
      });
    }

    return this.openai.chat.completions.create({
      model: config.openai.models.chat,
      messages,
      temperature: 0.7,
      max_tokens: 2000
    });
  }

  private async handleCharacterDesign(
    contextMessages: Array<{role: string; content: string}>,
    context?: {
      characterId?: string;
    }
  ) {
    const systemPrompt = `你是一个专业的角色设计助手。请根据用户的需求，提供专业的角色设计建议。
注意以下几点：
1. 角色背景的丰富性和合理性
2. 性格特征的鲜明性和立体感
3. 人物动机的明确性
4. 角色关系的复杂性
5. 成长空间的预留`;

    return this.openai.chat.completions.create({
      model: config.openai.models.chat,
      messages: [
        { role: 'system', content: systemPrompt },
        ...contextMessages
      ],
      temperature: 0.7,
      max_tokens: 2000
    });
  }

  private async handlePlotSuggestion(
    contextMessages: Array<{role: string; content: string}>,
    context?: Record<string, any>
  ) {
    const systemPrompt = `你是一个专业的剧情设计助手。请根据用户的需求，提供专业的剧情建议。
注意以下几点：
1. 情节的紧凑性和吸引力
2. 冲突的设置和推进
3. 悬念的布局和揭示
4. 结局的合理性和意外性
5. 主题的深度和寓意`;

    return this.openai.chat.completions.create({
      model: config.openai.models.chat,
      messages: [
        { role: 'system', content: systemPrompt },
        ...contextMessages
      ],
      temperature: 0.7,
      max_tokens: 2000
    });
  }

  private async handleClueDesign(
    contextMessages: Array<{role: string; content: string}>,
    context?: {
      clueId?: string;
    }
  ) {
    const systemPrompt = `你是一个专业的线索设计助手。请根据用户的需求，提供专业的线索设计建议。
注意以下几点：
1. 线索的关联性和重要性
2. 发现线索的难度梯度
3. 线索的真实性和误导性
4. 线索分布的均衡性
5. 解谜过程的趣味性`;

    return this.openai.chat.completions.create({
      model: config.openai.models.chat,
      messages: [
        { role: 'system', content: systemPrompt },
        ...contextMessages
      ],
      temperature: 0.7,
      max_tokens: 2000
    });
  }

  private async handleGeneralMessage(
    contextMessages: Array<{role: string; content: string}>
  ) {
    const systemPrompt = `你是一个专业的剧本创作助手。请根据用户的需求提供帮助。`;

    return this.openai.chat.completions.create({
      model: config.openai.models.chat,
      messages: [
        { role: 'system', content: systemPrompt },
        ...contextMessages
      ],
      temperature: 0.7,
      max_tokens: 2000
    });
  }

  async getSessionMessages(
    sessionId: string,
    options: {
      limit?: number;
      before?: string;
      type?: MessageType;
    } = {}
  ): Promise<IMessage[]> {
    const query: any = {
      sessionId,
      status: MessageStatus.COMPLETED
    };

    if (options.before) {
      query.createdAt = { $lt: options.before };
    }

    if (options.type) {
      query.type = options.type;
    }

    return Message.find(query)
      .sort({ createdAt: -1 })
      .limit(options.limit || 20);
  }

  async listSessions(
    projectId: string,
    options: {
      status?: string;
      limit?: number;
      page?: number;
    } = {}
  ): Promise<{
    sessions: ISession[];
    total: number;
    page: number;
    pages: number;
  }> {
    const query: any = { projectId };
    
    if (options.status) {
      query.status = options.status;
    }

    const limit = options.limit || 10;
    const page = options.page || 1;
    const skip = (page - 1) * limit;

    const [sessions, total] = await Promise.all([
      Session.find(query)
        .sort({ 'metadata.lastMessageAt': -1 })
        .skip(skip)
        .limit(limit),
      Session.countDocuments(query)
    ]);

    return {
      sessions,
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  }

  async updateSession(
    sessionId: string,
    data: {
      title?: string;
      status?: string;
      context?: Record<string, any>;
    }
  ): Promise<ISession> {
    const session = await Session.findById(sessionId);
    if (!session) {
      throw new errors.SessionNotFoundError(sessionId);
    }

    if (data.title) {
      session.title = data.title;
    }

    if (data.status) {
      session.status = data.status as any;
    }

    if (data.context) {
      session.metadata.context = {
        ...session.metadata.context,
        ...data.context
      };
    }

    await session.save();
    return session;
  }

  async deleteSession(sessionId: string): Promise<void> {
    const session = await Session.findById(sessionId);
    if (!session) {
      throw new errors.SessionNotFoundError(sessionId);
    }

    session.status = SessionStatus.DELETED;
    await session.save();
  }

  async regenerateMessage(messageId: string): Promise<IMessage> {
    const message = await Message.findById(messageId);
    if (!message) {
      throw new errors.MessageNotFoundError(messageId);
    }

    // 只能重新生成助手消息
    if (message.role !== MessageRole.ASSISTANT) {
      throw new errors.ChatError('只能重新生成助手消息');
    }

    // 设置消息状态为处理中
    message.status = MessageStatus.PROCESSING;
    await message.save();

    try {
      // 获取上下文消息
      const contextMessages = await this.getContextMessages(message.sessionId.toString());
      
      // 根据消息类型重新生成
      let response;
      switch (message.type) {
        case MessageType.SCRIPT_EDIT:
          response = await this.handleScriptEdit(contextMessages, message.metadata?.context);
          break;
        case MessageType.CHARACTER_DESIGN:
          response = await this.handleCharacterDesign(contextMessages, message.metadata?.context);
          break;
        case MessageType.PLOT_SUGGESTION:
          response = await this.handlePlotSuggestion(contextMessages, message.metadata?.context);
          break;
        case MessageType.CLUE_DESIGN:
          response = await this.handleClueDesign(contextMessages, message.metadata?.context);
          break;
        default:
          response = await this.handleGeneralMessage(contextMessages);
      }

      // 更新消息
      message.content = response.content;
      message.status = MessageStatus.COMPLETED;
      message.metadata = {
        ...message.metadata,
        tokens: response.usage?.total_tokens || 0,
        processingTime: Date.now() - message.createdAt.getTime()
      };

      await message.save();
      return message;
    } catch (error) {
      // 处理错误
      message.status = MessageStatus.FAILED;
      message.metadata = {
        ...message.metadata,
        error: error.message
      };
      await message.save();
      throw error;
    }
  }

  async getSessionStats(
    projectId: string,
    options: {
      startDate?: string;
      endDate?: string;
    } = {}
  ): Promise<{
    totalSessions: number;
    totalMessages: number;
    averageMessagesPerSession: number;
    messagesByType: Record<string, number>;
    messagesByStatus: Record<string, number>;
  }> {
    const query: any = { projectId };

    if (options.startDate || options.endDate) {
      query.createdAt = {};
      if (options.startDate) {
        query.createdAt.$gte = new Date(options.startDate);
      }
      if (options.endDate) {
        query.createdAt.$lte = new Date(options.endDate);
      }
    }

    const [
      totalSessions,
      totalMessages,
      messagesByType,
      messagesByStatus
    ] = await Promise.all([
      Session.countDocuments(query),
      Message.countDocuments(query),
      Message.aggregate([
        { $match: query },
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]),
      Message.aggregate([
        { $match: query },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    ]);

    return {
      totalSessions,
      totalMessages,
      averageMessagesPerSession: totalSessions ? totalMessages / totalSessions : 0,
      messagesByType: messagesByType.reduce((acc, { _id, count }) => {
        acc[_id] = count;
        return acc;
      }, {}),
      messagesByStatus: messagesByStatus.reduce((acc, { _id, count }) => {
        acc[_id] = count;
        return acc;
      }, {})
    };
  }
} 