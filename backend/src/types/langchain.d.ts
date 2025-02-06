declare module 'langchain/chains' {
  export class BaseChain {
    constructor(config?: { verbose?: boolean });
    call(input: any): Promise<any>;
  }
}

declare module 'langchain/memory' {
  export class BaseMemory {
    saveContext(input: any, output: any): Promise<void>;
    loadMemoryVariables(input: any): Promise<any>;
  }
  
  export class BufferMemory extends BaseMemory {
    constructor(config: {
      memoryKey: string;
      returnMessages: boolean;
      outputKey: string;
    });
  }
}

declare module 'langchain/callbacks' {
  export interface CallbackManagerForChainRun {
    getChild(): any;
  }
}

declare module '@langchain/openai' {
  export class ChatOpenAI {
    constructor(config: {
      modelName: string;
      temperature?: number;
      maxTokens?: number;
      apiKey?: string;
    });
    call(input: string): Promise<string>;
  }
}

declare module '@langchain/core/retrievers' {
  export class BaseRetriever {
    getRelevantDocuments(query: string): Promise<Array<{ pageContent: string }>>;
  }
}

declare module '@langchain/core/prompts' {
  export class PromptTemplate {
    constructor(config: {
      template: string;
      inputVariables: string[];
    });
    format(input: Record<string, any>): Promise<string>;
  }
}

declare module '@langchain/community/retrievers/milvus' {
  import { BaseRetriever } from '@langchain/core/retrievers';
  
  export class MilvusRetriever extends BaseRetriever {
    constructor(config: {
      url: string;
      username?: string;
      password?: string;
      collectionName: string;
      ssl?: boolean;
    });
  }
} 