import { Types } from 'mongoose';
import { Knowledge, KnowledgeType, IKnowledge } from '../models/knowledge.model';
import { MilvusClient } from '@zilliz/milvus2-sdk-node';
import { OpenAI } from 'openai';
import { RagError } from '../errors/rag.error';
import { config } from '../../../config';
import { logger } from '@utils/logger';
import { ExternalServiceError } from '@utils/errors';

// 定义更新知识的 DTO 接口
interface UpdateKnowledgeDto {
  title?: string;
  content?: string;
  type?: KnowledgeType;
  tags?: string[];
  metadata?: Record<string, any>;
  isPublic?: boolean;
  embedding?: number[];
}

export class RAGService {
  private milvusClient: MilvusClient;
  private readonly collectionName: string;
  private readonly dimension: number;
  private openai: OpenAI;
  private isVectorSearchEnabled: boolean = false;
  private isInitializing: boolean = false;
  private initializationError: Error | null = null;

  constructor() {
    this.milvusClient = new MilvusClient(config.milvus.address);
    this.collectionName = config.milvus.collection;
    this.dimension = config.milvus.dimension;
    this.openai = new OpenAI({
      apiKey: config.openai.apiKey
    });
    this.initialize();
  }

  private async initialize() {
    try {
      // 检查并创建集合
      const hasCollection = await this.milvusClient.hasCollection({
        collection_name: this.collectionName
      });

      if (!hasCollection) {
        await this.createCollection();
      }

      // 加载集合
      await this.milvusClient.loadCollectionSync({
        collection_name: this.collectionName
      });

      logger.info('RAG服务初始化成功');
    } catch (error) {
      logger.error('RAG服务初始化失败:', error);
      throw new ExternalServiceError('RAG服务初始化失败', 'Milvus');
    }
  }

  private async createCollection() {
    try {
      await this.milvusClient.createCollection({
        collection_name: this.collectionName,
        dimension: this.dimension,
        metric_type: config.milvus.indexParams.metricType
      });

      // 创建索引
      await this.milvusClient.createIndex({
        collection_name: this.collectionName,
        field_name: 'vector',
        extra_params: {
          index_type: config.milvus.indexParams.indexType,
          metric_type: config.milvus.indexParams.metricType,
          params: JSON.stringify(config.milvus.indexParams.params)
        }
      });

      logger.info('向量集合创建成功');
    } catch (error) {
      logger.error('创建向量集合失败:', error);
      throw new ExternalServiceError('创建向量集合失败', 'Milvus');
    }
  }

  /**
   * 生成文本嵌入
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text
      });
      return response.data[0].embedding;
    } catch (error) {
      throw new RagError('生成文本嵌入失败', 500);
    }
  }

  /**
   * 添加知识到知识库
   */
  async addKnowledge(
    userId: string,
    projectId: string,
    data: {
      title: string;
      content: string;
      type: KnowledgeType;
      tags?: string[];
      metadata?: Record<string, any>;
      isPublic?: boolean;
    }
  ): Promise<IKnowledge> {
    try {
      // 生成文本嵌入
      const embedding = await this.generateEmbedding(data.content);

      // 创建知识记录
      const knowledge = await new Knowledge({
        ...data,
        embedding,
        creator: new Types.ObjectId(userId),
        projectId: new Types.ObjectId(projectId)
      }).save();

      // 尝试初始化 Milvus 并插入向量
      if (await this.tryInitializeMilvus()) {
        try {
          await this.milvusClient.insert({
            collection_name: this.collectionName,
            fields_data: [{
              id: knowledge.id,
              vector: embedding,
              metadata: JSON.stringify(metadata)
            }]
          });
        } catch (error) {
          console.error('向量插入失败:', error);
          // 不影响主流程，仅记录错误
        }
      }

      return knowledge;
    } catch (error) {
      throw new RagError('添加知识失败', 500);
    }
  }

  /**
   * 搜索相关知识
   */
  async searchKnowledge(
    userId: string,
    projectId: string,
    query: string,
    options: {
      type?: KnowledgeType;
      tags?: string[];
      limit?: number;
      threshold?: number;
    } = {}
  ): Promise<IKnowledge[]> {
    try {
      const {
        type,
        tags,
        limit = 5,
        threshold = 0.7
      } = options;

      // 尝试初始化 Milvus
      const vectorSearchAvailable = await this.tryInitializeMilvus();

      // 如果向量搜索不可用，则使用文本搜索
      if (!vectorSearchAvailable) {
        return this.searchKnowledgeByText(userId, projectId, query, options);
      }

      // 生成查询文本的嵌入
      const queryEmbedding = await this.generateEmbedding(query);

      // 在 Milvus 中搜索相似向量
      const searchResponse = await this.milvusClient.search({
        collection_name: this.collectionName,
        vector: queryEmbedding,
        limit: limit * 2, // 多检索一些，以便后续过滤
        params: { nprobe: 16 }
      });

      // 获取相似度大于阈值的文档 ID
      const relevantIds = searchResponse.results
        .filter(result => result.score >= threshold)
        .map(result => result.id);

      // 从数据库中获取知识记录
      const filter: any = {
        _id: { $in: relevantIds.map(id => new Types.ObjectId(id)) },
        projectId: new Types.ObjectId(projectId),
        $or: [
          { creator: new Types.ObjectId(userId) },
          { isPublic: true }
        ]
      };

      if (type) {
        filter.type = type;
      }

      if (tags?.length) {
        filter.tags = { $in: tags };
      }

      const knowledge = await Knowledge.find(filter)
        .limit(limit)
        .populate('creator', 'username')
        .sort({ createdAt: -1 });

      return knowledge;
    } catch (error) {
      console.error('向量搜索失败，回退到文本搜索:', error);
      return this.searchKnowledgeByText(userId, projectId, query, options);
    }
  }

  /**
   * 使用文本搜索
   */
  private async searchKnowledgeByText(
    userId: string,
    projectId: string,
    query: string,
    options: {
      type?: KnowledgeType;
      tags?: string[];
      limit?: number;
    }
  ): Promise<IKnowledge[]> {
    const { type, tags, limit = 5 } = options;

    const filter: any = {
      projectId: new Types.ObjectId(projectId),
      $or: [
        { creator: new Types.ObjectId(userId) },
        { isPublic: true }
      ],
      $text: { $search: query }
    };

    if (type) {
      filter.type = type;
    }

    if (tags?.length) {
      filter.tags = { $in: tags };
    }

    return Knowledge.find(filter)
      .limit(limit)
      .populate('creator', 'username')
      .sort({ score: { $meta: 'textScore' } });
  }

  /**
   * 删除知识
   */
  async deleteKnowledge(userId: string, knowledgeId: string): Promise<void> {
    try {
      const knowledge = await Knowledge.findById(knowledgeId);

      if (!knowledge) {
        throw new RagError('知识不存在', 404);
      }

      if (knowledge.creator.toString() !== userId) {
        throw new RagError('没有权限删除此知识', 403);
      }

      // 从数据库中删除
      await knowledge.deleteOne();

      // 尝试初始化 Milvus 并删除向量
      if (await this.tryInitializeMilvus()) {
        try {
          await this.milvusClient.deleteEntities({
            collection_name: this.collectionName,
            expr: `id == "${knowledgeId}"`
          });
        } catch (error) {
          console.error('从向量库删除失败:', error);
          // 不影响主流程，仅记录错误
        }
      }
    } catch (error) {
      if (error instanceof RagError) throw error;
      throw new RagError('删除知识失败', 500);
    }
  }

  /**
   * 更新知识
   */
  async updateKnowledge(
    userId: string,
    knowledgeId: string,
    data: UpdateKnowledgeDto
  ): Promise<IKnowledge> {
    try {
      const knowledge = await Knowledge.findById(knowledgeId);

      if (!knowledge) {
        throw new RagError('知识不存在', 404);
      }

      if (knowledge.creator.toString() !== userId) {
        throw new RagError('没有权限更新此知识', 403);
      }

      // 如果内容发生变化，需要重新生成嵌入
      if (data.content) {
        data.embedding = await this.generateEmbedding(data.content);

        // 尝试初始化 Milvus 并更新向量
        if (await this.tryInitializeMilvus()) {
          try {
            await this.milvusClient.deleteEntities({
              collection_name: this.collectionName,
              expr: `id == "${knowledgeId}"`
            });

            await this.milvusClient.insert({
              collection_name: this.collectionName,
              fields_data: [{
                id: knowledgeId,
                vector: data.embedding,
                metadata: JSON.stringify(data.metadata)
              }]
            });
          } catch (error) {
            console.error('更新向量失败:', error);
            // 不影响主流程，仅记录错误
          }
        }
      }

      // 更新知识记录
      const updatedKnowledge = await Knowledge.findByIdAndUpdate(
        knowledgeId,
        { $set: data },
        { new: true, runValidators: true }
      ).populate('creator', 'username');

      if (!updatedKnowledge) {
        throw new RagError('更新知识失败', 500);
      }

      return updatedKnowledge;
    } catch (error) {
      if (error instanceof RagError) throw error;
      throw new RagError('更新知识失败', 500);
    }
  }

  /**
   * 批量导入知识
   */
  async bulkImport(
    userId: string,
    projectId: string,
    knowledge: Array<{
      title: string;
      content: string;
      type: KnowledgeType;
      tags?: string[];
      metadata?: Record<string, any>;
      isPublic?: boolean;
    }>
  ): Promise<IKnowledge[]> {
    try {
      const results: IKnowledge[] = [];

      // 批量处理，每批 10 条
      const batchSize = 10;
      for (let i = 0; i < knowledge.length; i += batchSize) {
        const batch = knowledge.slice(i, i + batchSize);
        const batchPromises = batch.map(item => this.addKnowledge(userId, projectId, item));
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      }

      return results;
    } catch (error) {
      throw new RagError('批量导入知识失败', 500);
    }
  }

  /**
   * 尝试初始化 Milvus
   */
  private async tryInitializeMilvus() {
    try {
      await this.initialize();
      return true;
    } catch (error) {
      return false;
    }
  }

  async getCollectionStats() {
    try {
      const stats = await this.milvusClient.getCollectionStatistics({
        collection_name: this.collectionName
      });

      return {
        rowCount: stats.row_count,
        ...stats
      };
    } catch (error) {
      logger.error('获取集合统计失败:', error);
      throw new ExternalServiceError('获取集合统计失败', 'RAG');
    }
  }
}

export const ragService = new RAGService(); 