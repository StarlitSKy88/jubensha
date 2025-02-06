import { MilvusClient } from '@zilliz/milvus2-sdk-node';
import { VectorData } from '../interfaces/vector';

export class VectorService {
  private client: MilvusClient;
  private readonly collectionName = 'knowledge_base';
  
  constructor() {
    this.client = new MilvusClient({
      address: process.env.MILVUS_ADDRESS || 'localhost:19530'
    });
  }

  async initialize(): Promise<void> {
    const exists = await this.client.hasCollection({
      collection_name: this.collectionName
    });

    if (!exists) {
      await this.createCollection();
    }
  }

  private async createCollection(): Promise<void> {
    await this.client.createCollection({
      collection_name: this.collectionName,
      fields: [
        {
          name: 'id',
          data_type: 'VarChar',
          is_primary_key: true,
          max_length: 36
        },
        {
          name: 'content',
          data_type: 'VarChar',
          max_length: 65535
        },
        {
          name: 'embedding',
          data_type: 'FloatVector',
          dim: 1536
        }
      ]
    });
  }

  async insert(data: VectorData): Promise<string> {
    await this.client.insert({
      collection_name: this.collectionName,
      fields_data: [{
        id: data.id,
        content: data.content,
        embedding: data.embedding
      }]
    });
    return data.id;
  }

  async search(embedding: number[], topK: number = 5): Promise<VectorData[]> {
    const result = await this.client.search({
      collection_name: this.collectionName,
      vector: embedding,
      output_fields: ['id', 'content'],
      limit: topK
    });

    return result.results.map(item => ({
      id: item.id,
      content: item.content,
      embedding: []  // 搜索结果不返回embedding
    }));
  }
} 