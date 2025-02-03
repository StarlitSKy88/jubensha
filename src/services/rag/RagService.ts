import { ZillizClient } from '@zilliz/milvus2-sdk-node';
import { SentenceTransformer } from 'sentence-transformers';
import { AppError } from '../../utils/error';

interface EmbeddingConfig {
  modelName: string;
  dimension: number;
}

interface ZillizConfig {
  uri: string;
  token: string;
  collectionName: string;
}

interface RagServiceConfig {
  embedding: EmbeddingConfig;
  vectorDb: ZillizConfig;
}

export class RagService {
  private embedder: SentenceTransformer;
  private vectorDb: ZillizClient;
  private config: RagServiceConfig;

  constructor(config: RagServiceConfig) {
    this.config = config;
    this.initService();
  }

  private async initService() {
    try {
      // 初始化文本嵌入模型
      this.embedder = new SentenceTransformer(this.config.embedding.modelName);
      
      // 初始化向量数据库客户端
      this.vectorDb = new ZillizClient({
        address: this.config.vectorDb.uri,
        token: this.config.vectorDb.token
      });

      // 确保集合存在
      await this.ensureCollection();
    } catch (error) {
      throw new AppError('RAG_INIT_ERROR', '初始化RAG服务失败', error);
    }
  }

  private async ensureCollection() {
    try {
      const hasCollection = await this.vectorDb.hasCollection(this.config.vectorDb.collectionName);
      
      if (!hasCollection) {
        await this.createCollection();
      }
    } catch (error) {
      throw new AppError('COLLECTION_ERROR', '检查/创建集合失败', error);
    }
  }

  private async createCollection() {
    try {
      await this.vectorDb.createCollection({
        collection_name: this.config.vectorDb.collectionName,
        dimension: this.config.embedding.dimension,
        description: '故事角色管理系统的知识库集合'
      });
    } catch (error) {
      throw new AppError('CREATE_COLLECTION_ERROR', '创建集合失败', error);
    }
  }

  // 文本嵌入方法
  public async embedText(text: string): Promise<number[]> {
    try {
      return await this.embedder.encode(text);
    } catch (error) {
      throw new AppError('EMBEDDING_ERROR', '文本嵌入失败', error);
    }
  }

  // 向量检索方法
  public async search(query: string, limit: number = 5): Promise<any[]> {
    try {
      const queryVector = await this.embedText(query);
      
      return await this.vectorDb.search({
        collection_name: this.config.vectorDb.collectionName,
        vector: queryVector,
        limit: limit
      });
    } catch (error) {
      throw new AppError('SEARCH_ERROR', '向量检索失败', error);
    }
  }

  // 添加文档到知识库
  public async addDocument(text: string, metadata: any = {}): Promise<void> {
    try {
      const vector = await this.embedText(text);
      
      await this.vectorDb.insert({
        collection_name: this.config.vectorDb.collectionName,
        data: [{
          vector,
          metadata: JSON.stringify(metadata)
        }]
      });
    } catch (error) {
      throw new AppError('INSERT_ERROR', '添加文档失败', error);
    }
  }
} 