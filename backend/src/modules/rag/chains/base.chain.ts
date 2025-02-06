import { BaseChain } from 'langchain/chains';
import { BaseMemory } from 'langchain/memory';
import { CallbackManagerForChainRun } from 'langchain/callbacks';
import { ChatOpenAI } from '@langchain/openai';
import { BaseRetriever } from '@langchain/core/retrievers';
import { PromptTemplate } from '@langchain/core/prompts';

/**
 * 基础RAG Chain配置
 */
export interface BaseRAGChainConfig {
  llm: ChatOpenAI;
  retriever: BaseRetriever;
  memory?: BaseMemory;
  prompt?: PromptTemplate;
  verbose?: boolean;
}

/**
 * 基础RAG Chain输入
 */
export interface BaseRAGChainInput {
  query: string;
  context?: string;
  options?: Record<string, any>;
}

/**
 * 基础RAG Chain
 */
export abstract class BaseRAGChain extends BaseChain {
  protected llm: ChatOpenAI;
  protected retriever: BaseRetriever;
  protected memory?: BaseMemory;
  protected prompt?: PromptTemplate;

  constructor(config: BaseRAGChainConfig) {
    super({ verbose: config.verbose });
    this.llm = config.llm;
    this.retriever = config.retriever;
    this.memory = config.memory;
    this.prompt = config.prompt;
  }

  /**
   * 获取Chain的输入键
   */
  get inputKeys(): string[] {
    return ['query', 'context', 'options'];
  }

  /**
   * 获取Chain的输出键
   */
  get outputKeys(): string[] {
    return ['response'];
  }

  /**
   * 执行Chain
   */
  protected abstract _call(
    input: BaseRAGChainInput,
    runManager?: CallbackManagerForChainRun
  ): Promise<Record<string, any>>;

  /**
   * 检索相关文档
   */
  protected async retrieveDocuments(query: string): Promise<string[]> {
    const docs = await this.retriever.getRelevantDocuments(query);
    return docs.map(doc => doc.pageContent);
  }

  /**
   * 格式化上下文
   */
  protected async formatContext(documents: string[]): Promise<string> {
    return documents.join('\n\n');
  }

  /**
   * 保存到记忆
   */
  protected async saveToMemory(input: BaseRAGChainInput, output: Record<string, any>): Promise<void> {
    if (this.memory) {
      await this.memory.saveContext(
        { input: input.query },
        { output: output.response }
      );
    }
  }

  /**
   * 从记忆中加载
   */
  protected async loadFromMemory(input: BaseRAGChainInput): Promise<Record<string, any>> {
    if (this.memory) {
      return this.memory.loadMemoryVariables({
        input: input.query
      });
    }
    return {};
  }
} 