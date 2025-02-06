import axios from 'axios';
import { bertConfig } from '../../config/bert.config';

export class BertService {
  private readonly apiUrl: string;
  private readonly apiKey: string;

  constructor() {
    this.apiUrl = bertConfig.apiUrl;
    this.apiKey = bertConfig.apiKey;
  }

  // 生成文本embedding
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await axios.post(
        this.apiUrl,
        {
          text,
          model: 'bert-base-chinese'
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      return response.data.embedding;
    } catch (error) {
      console.error('Failed to generate embedding:', error);
      throw new Error('Failed to generate embedding');
    }
  }

  // 批量生成文本embedding
  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      const response = await axios.post(
        this.apiUrl,
        {
          texts,
          model: 'bert-base-chinese'
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      return response.data.embeddings;
    } catch (error) {
      console.error('Failed to generate embeddings:', error);
      throw new Error('Failed to generate embeddings');
    }
  }

  // 计算两个向量的余弦相似度
  calculateCosineSimilarity(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) {
      throw new Error('Vectors must have the same length');
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }

    norm1 = Math.sqrt(norm1);
    norm2 = Math.sqrt(norm2);

    if (norm1 === 0 || norm2 === 0) {
      return 0;
    }

    return dotProduct / (norm1 * norm2);
  }

  // 计算两个文本的语义相似度
  async calculateTextSimilarity(text1: string, text2: string): Promise<number> {
    const [embedding1, embedding2] = await this.generateEmbeddings([text1, text2]);
    return this.calculateCosineSimilarity(embedding1, embedding2);
  }
} 