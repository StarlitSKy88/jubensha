import { CallbackManagerForChainRun } from 'langchain/callbacks';
import { PromptTemplate } from '@langchain/core/prompts';
import { BaseRAGChain, BaseRAGChainConfig, BaseRAGChainInput } from './base.chain';

/**
 * 角色分析Chain配置
 */
export interface CharacterAnalysisConfig extends BaseRAGChainConfig {
  aspects?: string[];
  detailLevel?: 'basic' | 'detailed' | 'comprehensive';
}

/**
 * 角色分析Chain输入
 */
export interface CharacterAnalysisInput extends BaseRAGChainInput {
  character: {
    name: string;
    description?: string;
    background?: string;
    traits?: string[];
  };
  aspects?: string[];
  detailLevel?: 'basic' | 'detailed' | 'comprehensive';
}

const DEFAULT_ASPECTS = [
  '性格特征',
  '动机与目标',
  '人际关系',
  '内心冲突',
  '成长潜力'
];

const DEFAULT_PROMPT_TEMPLATE = `你是一个专业的剧本分析师。请基于以下信息分析角色：

角色信息：
{character}

背景资料：
{context}

请从以下方面进行分析：
{aspects}

分析深度：{detailLevel}

要求：
1. 分析要客观、深入、具体
2. 结合背景资料进行分析
3. 给出改进建议
4. 输出JSON格式

输出格式：
{
  "aspects": {
    "方面1": {
      "analysis": "分析内容",
      "evidence": ["支持证据"],
      "suggestions": ["改进建议"]
    }
  },
  "summary": "总体评价",
  "score": 评分(1-100)
}`;

/**
 * 角色分析Chain
 */
export class CharacterAnalysisChain extends BaseRAGChain {
  private aspects: string[];
  private detailLevel: 'basic' | 'detailed' | 'comprehensive';

  constructor(config: CharacterAnalysisConfig) {
    super(config);
    this.aspects = config.aspects || DEFAULT_ASPECTS;
    this.detailLevel = config.detailLevel || 'detailed';
    this.prompt = config.prompt || new PromptTemplate({
      template: DEFAULT_PROMPT_TEMPLATE,
      inputVariables: ['character', 'context', 'aspects', 'detailLevel']
    });
  }

  /**
   * 执行Chain
   */
  protected async _call(
    input: CharacterAnalysisInput,
    runManager?: CallbackManagerForChainRun
  ): Promise<Record<string, any>> {
    try {
      // 1. 构建搜索查询
      const searchQuery = this.buildSearchQuery(input.character);

      // 2. 检索相关文档
      const documents = await this.retrieveDocuments(searchQuery);

      // 3. 格式化上下文
      const context = await this.formatContext(documents);

      // 4. 加载历史记忆
      const memory = await this.loadFromMemory(input);

      // 5. 准备分析参数
      const aspects = input.aspects || this.aspects;
      const detailLevel = input.detailLevel || this.detailLevel;

      // 6. 生成提示
      const prompt = await this.prompt!.format({
        character: JSON.stringify(input.character, null, 2),
        context,
        aspects: aspects.join('\n'),
        detailLevel,
        memory: JSON.stringify(memory)
      });

      // 7. 调用LLM
      const response = await this.llm.call(prompt);

      // 8. 解析结果
      const result = this.parseResponse(response);

      // 9. 保存到记忆
      await this.saveToMemory(input, result);

      return result;
    } catch (error) {
      console.error('Error in CharacterAnalysisChain:', error);
      throw new Error('Failed to analyze character');
    }
  }

  /**
   * 构建搜索查询
   */
  private buildSearchQuery(character: CharacterAnalysisInput['character']): string {
    const parts = [
      character.name,
      character.description,
      character.background,
      ...(character.traits || [])
    ].filter(Boolean);
    return parts.join(' ');
  }

  /**
   * 解析响应
   */
  private parseResponse(response: string): Record<string, any> {
    try {
      return JSON.parse(response);
    } catch (error) {
      console.error('Failed to parse response:', error);
      return {
        error: 'Failed to parse analysis result',
        rawResponse: response
      };
    }
  }
} 