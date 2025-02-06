import { ChatOpenAI } from '@langchain/openai';
import { MilvusRetriever } from '@langchain/community/retrievers/milvus';
import { BufferMemory } from 'langchain/memory';
import { CharacterAnalysisChain, CharacterAnalysisInput } from '../chains/character-analysis.chain';
import { KnowledgeModel } from '../models/knowledge.model';
import { config } from '@config';
import { logger } from '@utils/logger';

/**
 * 角色分析服务
 */
export class CharacterAnalysisService {
  private chain: CharacterAnalysisChain;
  private retriever: MilvusRetriever;

  constructor() {
    // 初始化LLM
    const llm = new ChatOpenAI({
      modelName: config.openai.models.chat,
      temperature: 0.7,
      maxTokens: 2000
    });

    // 初始化向量检索器
    this.retriever = new MilvusRetriever({
      url: config.milvus.address,
      username: config.milvus.username,
      password: config.milvus.password,
      collectionName: config.milvus.collection,
      ssl: config.milvus.ssl
    });

    // 初始化记忆
    const memory = new BufferMemory({
      memoryKey: 'chat_history',
      returnMessages: true,
      outputKey: 'response'
    });

    // 初始化Chain
    this.chain = new CharacterAnalysisChain({
      llm,
      retriever: this.retriever,
      memory,
      verbose: true
    });
  }

  /**
   * 分析角色
   */
  async analyzeCharacter(character: any, options?: {
    aspects?: string[];
    detailLevel?: 'brief' | 'normal' | 'detailed';
    topK?: number;
  }) {
    try {
      logger.info('开始角色分析', {
        characterId: character.id,
        options
      });

      // 1. 验证角色数据
      this.validateCharacter(character);

      // 2. 准备知识库数据
      await this.prepareKnowledgeBase(character);

      // 3. 执行分析
      const result = await this.chain.call({
        character,
        options: {
          topK: options?.topK || 5
        }
      });

      // 4. 记录结果
      logger.info('角色分析完成', {
        characterId: character.id,
        score: result.response.score
      });

      return result;
    } catch (error) {
      logger.error('角色分析失败', {
        characterId: character.id,
        error
      });
      throw error;
    }
  }

  /**
   * 验证角色数据
   */
  private validateCharacter(character: any) {
    const requiredFields = ['name', 'type', 'description', 'personality'];
    const missingFields = requiredFields.filter(field => !character[field]);

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
  }

  /**
   * 准备知识库数据
   */
  private async prepareKnowledgeBase(character: any) {
    try {
      // 1. 检查是否存在相关知识
      const existingKnowledge = await KnowledgeModel.findOne({
        type: 'character_archetype',
        'metadata.characterId': character.id
      });

      // 2. 如果不存在，创建新的知识条目
      if (!existingKnowledge) {
        const knowledge = new KnowledgeModel({
          title: `角色原型: ${character.name}`,
          content: JSON.stringify(character),
          type: 'character_archetype',
          category: character.type,
          summary: character.description,
          tags: [...(character.tags || []), character.type],
          metadata: {
            characterId: character.id,
            source: 'character_analysis'
          }
        });

        await knowledge.save();
        logger.info('创建角色知识条目', {
          characterId: character.id,
          knowledgeId: knowledge.id
        });
      }
    } catch (error) {
      logger.error('准备知识库数据失败', {
        characterId: character.id,
        error
      });
      // 继续执行，不阻止分析过程
    }
  }
} 