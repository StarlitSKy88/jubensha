import { MilvusRetriever } from '@langchain/community/retrievers/milvus';
import { ChatOpenAI } from '@langchain/openai';
import { KnowledgeModel, type IKnowledge } from '../models/knowledge.model';
import { config } from '@config';
import { logger } from '@utils/logger';

export class KnowledgeService {
  private retriever: MilvusRetriever;
  private llm: ChatOpenAI;

  constructor() {
    // 初始化向量检索器
    this.retriever = new MilvusRetriever({
      url: config.milvus.address,
      username: config.milvus.username,
      password: config.milvus.password,
      collectionName: config.milvus.collection,
      ssl: config.milvus.ssl
    });

    // 初始化LLM
    this.llm = new ChatOpenAI({
      modelName: config.openai.models.embedding,
      temperature: 0,
      maxTokens: 1000
    });
  }

  /**
   * 创建知识条目
   */
  async createKnowledge(data: Partial<IKnowledge>): Promise<IKnowledge> {
    try {
      // 生成文本向量
      const embedding = await this.generateEmbedding(data.content);
      
      // 创建知识条目
      const knowledge = new KnowledgeModel({
        ...data,
        embedding
      });

      await knowledge.save();
      
      logger.info('知识条目创建成功', { knowledgeId: knowledge.id });
      return knowledge;
    } catch (error) {
      logger.error('知识条目创建失败', error);
      throw error;
    }
  }

  /**
   * 搜索知识
   */
  async searchKnowledge(query: string, options?: {
    limit?: number;
    type?: string;
    category?: string;
  }): Promise<IKnowledge[]> {
    try {
      // 生成查询向量
      const queryEmbedding = await this.generateEmbedding(query);
      
      // 向量检索
      const results = await this.retriever.getRelevantDocuments(query);
      
      // 获取完整知识条目
      const knowledgeIds = results.map(doc => doc.metadata.id);
      const knowledge = await KnowledgeModel.find({
        _id: { $in: knowledgeIds },
        ...(options?.type && { type: options.type }),
        ...(options?.category && { category: options.category })
      }).limit(options?.limit || 10);

      return knowledge;
    } catch (error) {
      logger.error('知识搜索失败', error);
      throw error;
    }
  }

  /**
   * 批量导入知识
   */
  async bulkImport(data: Partial<IKnowledge>[]): Promise<IKnowledge[]> {
    try {
      // 生成向量
      const embeddings = await Promise.all(
        data.map(item => this.generateEmbedding(item.content))
      );

      // 创建知识条目
      const knowledge = await KnowledgeModel.insertMany(
        data.map((item, index) => ({
          ...item,
          embedding: embeddings[index]
        }))
      );

      logger.info('批量导入知识成功', { count: knowledge.length });
      return knowledge;
    } catch (error) {
      logger.error('批量导入知识失败', error);
      throw error;
    }
  }

  /**
   * 生成文本向量
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.llm.call(text);
      return JSON.parse(response);
    } catch (error) {
      logger.error('生成向量失败', error);
      throw error;
    }
  }
} 