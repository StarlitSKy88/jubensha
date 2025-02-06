import { MilvusClient } from '@zilliz/milvus2-sdk-node';
import { ElasticsearchClient } from '@elastic/elasticsearch';
import { milvusConfig } from '../../config/milvus.config';
import { elasticsearchConfig } from '../../config/elasticsearch.config';
import { DocumentService } from '../document.service';
import { IDocument } from '../../interfaces/document.interface';

export class KnowledgeService {
  private milvusClient: MilvusClient;
  private esClient: ElasticsearchClient;
  private documentService: DocumentService;
  private readonly collectionName = 'document_embeddings';
  private readonly dimension = 768; // BERT embedding dimension

  constructor() {
    // 初始化Milvus客户端
    this.milvusClient = new MilvusClient({
      address: milvusConfig.address,
      username: milvusConfig.username,
      password: milvusConfig.password
    });

    // 初始化Elasticsearch客户端
    this.esClient = new ElasticsearchClient({
      node: elasticsearchConfig.node,
      auth: {
        username: elasticsearchConfig.username,
        password: elasticsearchConfig.password
      }
    });

    this.documentService = new DocumentService();
    this.init();
  }

  // 初始化向量数据库和搜索引擎
  private async init() {
    await this.initMilvus();
    await this.initElasticsearch();
  }

  // 初始化Milvus集合
  private async initMilvus() {
    const hasCollection = await this.milvusClient.hasCollection({
      collection_name: this.collectionName
    });

    if (!hasCollection) {
      await this.milvusClient.createCollection({
        collection_name: this.collectionName,
        fields: [
          {
            name: 'id',
            data_type: 'VarChar',
            is_primary_key: true,
            max_length: 36
          },
          {
            name: 'embedding',
            data_type: 'FloatVector',
            dim: this.dimension
          }
        ]
      });

      // 创建索引
      await this.milvusClient.createIndex({
        collection_name: this.collectionName,
        field_name: 'embedding',
        index_type: 'IVF_FLAT',
        metric_type: 'L2',
        params: { nlist: 1024 }
      });
    }
  }

  // 初始化Elasticsearch索引
  private async initElasticsearch() {
    const indexExists = await this.esClient.indices.exists({
      index: 'documents'
    });

    if (!indexExists) {
      await this.esClient.indices.create({
        index: 'documents',
        body: {
          mappings: {
            properties: {
              id: { type: 'keyword' },
              title: { type: 'text', analyzer: 'ik_max_word' },
              content: { type: 'text', analyzer: 'ik_max_word' },
              type: { type: 'keyword' },
              tags: { type: 'keyword' },
              status: { type: 'keyword' },
              createdAt: { type: 'date' },
              updatedAt: { type: 'date' }
            }
          }
        }
      });
    }
  }

  // 添加文档到知识库
  async addDocument(document: IDocument) {
    // 生成文档embedding
    const embedding = await this.generateEmbedding(document.content);

    // 存储embedding到Milvus
    await this.milvusClient.insert({
      collection_name: this.collectionName,
      fields_data: [{
        id: document._id.toString(),
        embedding
      }]
    });

    // 存储文档到Elasticsearch
    await this.esClient.index({
      index: 'documents',
      id: document._id.toString(),
      body: {
        id: document._id.toString(),
        title: document.title,
        content: document.content,
        type: document.type,
        tags: document.tags,
        status: document.status,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt
      }
    });
  }

  // 从知识库删除文档
  async removeDocument(documentId: string) {
    // 从Milvus删除
    await this.milvusClient.delete({
      collection_name: this.collectionName,
      expr: `id == "${documentId}"`
    });

    // 从Elasticsearch删除
    await this.esClient.delete({
      index: 'documents',
      id: documentId
    });
  }

  // 更新知识库中的文档
  async updateDocument(document: IDocument) {
    await this.removeDocument(document._id.toString());
    await this.addDocument(document);
  }

  // 语义搜索
  async semanticSearch(query: string, limit: number = 10) {
    // 生成查询embedding
    const queryEmbedding = await this.generateEmbedding(query);

    // 在Milvus中搜索相似文档
    const searchResult = await this.milvusClient.search({
      collection_name: this.collectionName,
      vector: queryEmbedding,
      limit,
      output_fields: ['id']
    });

    // 获取文档详情
    const documentIds = searchResult.results.map(r => r.id);
    const documents = await Promise.all(
      documentIds.map(id => this.documentService.getDocument(id))
    );

    return documents;
  }

  // 关键词搜索
  async keywordSearch(query: string, options: {
    type?: string;
    tags?: string[];
    status?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const { type, tags, status, page = 1, limit = 10 } = options;

    // 构建查询条件
    const must: any[] = [
      {
        multi_match: {
          query,
          fields: ['title^2', 'content']
        }
      }
    ];

    if (type) {
      must.push({ term: { type } });
    }
    if (tags?.length) {
      must.push({ terms: { tags } });
    }
    if (status) {
      must.push({ term: { status } });
    }

    // 执行搜索
    const result = await this.esClient.search({
      index: 'documents',
      body: {
        from: (page - 1) * limit,
        size: limit,
        query: {
          bool: { must }
        },
        sort: [
          { _score: 'desc' },
          { updatedAt: 'desc' }
        ]
      }
    });

    // 获取文档详情
    const documentIds = result.hits.hits.map(hit => hit._id);
    const documents = await Promise.all(
      documentIds.map(id => this.documentService.getDocument(id))
    );

    return {
      documents,
      total: result.hits.total.value
    };
  }

  // 混合搜索(结合语义和关键词)
  async hybridSearch(query: string, options: {
    type?: string;
    tags?: string[];
    status?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const [semanticResults, keywordResults] = await Promise.all([
      this.semanticSearch(query, options.limit),
      this.keywordSearch(query, options)
    ]);

    // 合并结果并去重
    const documentMap = new Map<string, IDocument>();
    semanticResults.forEach(doc => documentMap.set(doc._id.toString(), doc));
    keywordResults.documents.forEach(doc => {
      if (!documentMap.has(doc._id.toString())) {
        documentMap.set(doc._id.toString(), doc);
      }
    });

    return Array.from(documentMap.values());
  }

  // 生成文本embedding
  private async generateEmbedding(text: string): Promise<number[]> {
    // TODO: 实现BERT embedding生成
    // 这里需要调用BERT服务生成文本的embedding向量
    return new Array(this.dimension).fill(0);
  }
} 