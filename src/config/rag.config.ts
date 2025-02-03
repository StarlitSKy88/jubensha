export const ragConfig = {
  embedding: {
    modelName: 'sentence-transformers/all-MiniLM-L6-v2',
    dimension: 384  // MiniLM-L6-v2模型的向量维度
  },
  vectorDb: {
    uri: process.env.ZILLIZ_URI || 'https://in01-17f69c1eaef8b9a.aws-us-west-2.vectordb.zillizcloud.com:19536',
    token: process.env.ZILLIZ_TOKEN || '',
    collectionName: 'story_knowledge_base'
  },
  collections: {
    base: 'base_knowledge',
    script: 'script_knowledge',
    novel: 'novel_knowledge'
  },
  indexParams: {
    index_type: 'IVF_FLAT',
    metric_type: 'L2',
    params: { nlist: 1024 }
  }
};

export const knowledgeTypes = {
  CHARACTER: 'character',
  PLOT: 'plot',
  DIALOGUE: 'dialogue',
  WORLDBUILDING: 'worldbuilding'
} as const;

export type KnowledgeType = typeof knowledgeTypes[keyof typeof knowledgeTypes];

export interface Knowledge {
  id: string;
  type: KnowledgeType;
  content: string;
  source: string;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
} 