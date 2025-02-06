import { KnowledgeModel, KnowledgeType, IKnowledge } from '../models/knowledge.model';
import { EmbeddingService } from './embedding.service';
import { RAGService } from './rag.service';
import { logger } from '@utils/logger';
import { NotFoundError, ValidationError } from '@utils/errors';

export class KnowledgeService {
  constructor(
    private embeddingService: EmbeddingService,
    private ragService: RAGService
  ) {}

  async createKnowledge(data: {
    type: KnowledgeType;
    title: string;
    content: string;
    metadata: {
      category: string;
      tags: string[];
      source: string;
      author: string;
    };
    projectId: string;
    createdBy: string;
  }): Promise<IKnowledge> {
    try {
      // 生成embedding
      const embedding = await this.embeddingService.generateEmbedding(
        data.content
      );

      // 创建知识文档
      const knowledge = await KnowledgeModel.create({
        ...data,
        embedding,
        updatedBy: data.createdBy,
        metadata: {
          ...data.metadata,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      // 添加到向量库
      await this.ragService.insertKnowledge({
        id: knowledge._id.toString(),
        content: knowledge.content,
        embedding,
        metadata: knowledge.metadata
      });

      return knowledge;
    } catch (error) {
      logger.error('创建知识失败:', error);
      throw error;
    }
  }

  async updateKnowledge(
    id: string,
    data: {
      title?: string;
      content?: string;
      metadata?: {
        category?: string;
        tags?: string[];
        source?: string;
      };
      updatedBy: string;
    }
  ): Promise<IKnowledge> {
    try {
      const knowledge = await KnowledgeModel.findById(id);
      if (!knowledge) {
        throw new NotFoundError('知识不存在');
      }

      // 如果更新了内容，需要重新生成embedding
      let embedding;
      if (data.content) {
        embedding = await this.embeddingService.generateEmbedding(data.content);
      }

      // 更新知识文档
      const updatedKnowledge = await KnowledgeModel.findByIdAndUpdate(
        id,
        {
          ...data,
          ...(embedding && { embedding }),
          'metadata.updatedAt': new Date()
        },
        { new: true }
      );

      if (!updatedKnowledge) {
        throw new NotFoundError('知识不存在');
      }

      // 如果更新了内容或元数据，需要更新向量库
      if (data.content || data.metadata) {
        await this.ragService.updateKnowledge({
          id: updatedKnowledge._id.toString(),
          content: data.content,
          embedding,
          metadata: updatedKnowledge.metadata
        });
      }

      return updatedKnowledge;
    } catch (error) {
      logger.error('更新知识失败:', error);
      throw error;
    }
  }

  async deleteKnowledge(id: string): Promise<void> {
    try {
      const knowledge = await KnowledgeModel.findById(id);
      if (!knowledge) {
        throw new NotFoundError('知识不存在');
      }

      // 软删除知识文档
      await KnowledgeModel.findByIdAndUpdate(id, {
        status: 'deleted',
        'metadata.updatedAt': new Date()
      });

      // 从向量库中删除
      await this.ragService.deleteKnowledge(id);
    } catch (error) {
      logger.error('删除知识失败:', error);
      throw error;
    }
  }

  async searchKnowledge(query: {
    text: string;
    type?: KnowledgeType;
    category?: string;
    tags?: string[];
    projectId: string;
    limit?: number;
  }): Promise<Array<IKnowledge & { score: number }>> {
    try {
      // 生成查询文本的embedding
      const queryEmbedding = await this.embeddingService.generateEmbedding(
        query.text
      );

      // 构建过滤条件
      let filter = `status == "active"`;
      if (query.type) {
        filter += ` && type == "${query.type}"`;
      }
      if (query.category) {
        filter += ` && metadata.category == "${query.category}"`;
      }
      if (query.tags && query.tags.length > 0) {
        const tagFilter = query.tags
          .map(tag => `metadata.tags CONTAINS "${tag}"`)
          .join(' && ');
        filter += ` && (${tagFilter})`;
      }

      // 执行向量搜索
      const searchResults = await this.ragService.searchSimilar({
        vector: queryEmbedding,
        limit: query.limit,
        filter
      });

      // 获取完整的知识文档
      const knowledgeList = await Promise.all(
        searchResults.map(async result => {
          const knowledge = await KnowledgeModel.findById(result.id);
          if (!knowledge) {
            return null;
          }
          return {
            ...knowledge.toObject(),
            score: result.score
          };
        })
      );

      return knowledgeList.filter(k => k !== null) as Array<
        IKnowledge & { score: number }
      >;
    } catch (error) {
      logger.error('搜索知识失败:', error);
      throw error;
    }
  }

  async getKnowledgeById(id: string): Promise<IKnowledge> {
    try {
      const knowledge = await KnowledgeModel.findOne({
        _id: id,
        status: 'active'
      });

      if (!knowledge) {
        throw new NotFoundError('知识不存在');
      }

      return knowledge;
    } catch (error) {
      logger.error('获取知识失败:', error);
      throw error;
    }
  }

  async getKnowledgeList(query: {
    projectId: string;
    type?: KnowledgeType;
    category?: string;
    tags?: string[];
    page?: number;
    limit?: number;
  }): Promise<{
    items: IKnowledge[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    try {
      const {
        projectId,
        type,
        category,
        tags,
        page = 1,
        limit = 10
      } = query;

      // 构建查询条件
      const filter: any = {
        projectId,
        status: 'active'
      };

      if (type) {
        filter.type = type;
      }
      if (category) {
        filter['metadata.category'] = category;
      }
      if (tags && tags.length > 0) {
        filter['metadata.tags'] = { $all: tags };
      }

      // 执行查询
      const [items, total] = await Promise.all([
        KnowledgeModel.find(filter)
          .skip((page - 1) * limit)
          .limit(limit)
          .sort({ 'metadata.updatedAt': -1 }),
        KnowledgeModel.countDocuments(filter)
      ]);

      return {
        items,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('获取知识列表失败:', error);
      throw error;
    }
  }

  async bulkImport(data: {
    items: Array<{
      type: KnowledgeType;
      title: string;
      content: string;
      metadata: {
        category: string;
        tags: string[];
        source: string;
        author: string;
      };
    }>;
    projectId: string;
    createdBy: string;
  }): Promise<{
    total: number;
    created: number;
    failed: number;
    errors: Array<{ index: number; error: string }>;
  }> {
    const results = {
      total: data.items.length,
      created: 0,
      failed: 0,
      errors: [] as Array<{ index: number; error: string }>
    };

    try {
      // 批量生成embeddings
      const contents = data.items.map(item => item.content);
      const embeddings = await this.embeddingService.generateBatchEmbeddings(
        contents
      );

      // 批量创建知识
      for (let i = 0; i < data.items.length; i++) {
        try {
          const item = data.items[i];
          const embedding = embeddings[i];

          const knowledge = await this.createKnowledge({
            ...item,
            projectId: data.projectId,
            createdBy: data.createdBy
          });

          results.created++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            index: i,
            error: error.message
          });
        }
      }

      return results;
    } catch (error) {
      logger.error('批量导入知识失败:', error);
      throw error;
    }
  }
} 