# RAG 模块说明

## 概述

RAG (Retrieval-Augmented Generation) 模块是本项目的核心组件之一，用于增强AI生成内容的专业性和准确性。通过向量数据库存储和检索专业知识，实现更好的剧本创作辅助功能。

## 架构设计

### 1. 核心组件

1. 向量数据库
   - 使用 Milvus (Zilliz Cloud)
   - 支持高效的向量检索
   - 提供集合管理功能
   - 实现数据持久化

2. 文本嵌入
   - 使用 Deepseek Embedding
   - 处理中文文本
   - 生成语义向量
   - 支持批量处理

3. 知识管理
   - 知识分类体系
   - 内容处理管道
   - 质量控制机制
   - 更新策略

### 2. 数据结构

1. 知识类型
```typescript
interface Knowledge {
  id: string;
  type: KnowledgeType;
  content: string;
  metadata: {
    category: string;
    tags: string[];
    source: string;
    timestamp: Date;
  };
  embedding?: number[];
}

enum KnowledgeType {
  PLOT_PATTERN = 'plot_pattern',
  CHARACTER_ARCHETYPE = 'character_archetype',
  STORY_STRUCTURE = 'story_structure',
  DIALOGUE_EXAMPLE = 'dialogue_example',
  CLUE_DESIGN = 'clue_design'
}
```

2. 向量索引
```typescript
interface VectorIndex {
  collection: string;
  dimension: number;
  metric_type: 'L2' | 'IP';
  index_type: 'IVF_FLAT' | 'IVF_SQ8';
  params: {
    nlist: number;
    nprobe: number;
  };
}
```

### 3. 主要功能

1. 知识库管理
   - 内容导入
   - 向量生成
   - 索引构建
   - 数据更新

2. 知识检索
   - 语义搜索
   - 相关度排序
   - 结果过滤
   - 上下文组装

3. 内容生成
   - 知识融合
   - 提示词优化
   - 一致性检查
   - 质量控制

## 实现细节

### 1. 初始化流程

```typescript
class RAGService {
  constructor(config: RAGConfig) {
    this.vectorStore = new MilvusClient(config.milvus);
    this.embedding = new DeepseekEmbedding(config.embedding);
    this.collections = new CollectionManager(config.collections);
  }

  async initialize() {
    await this.collections.ensureCollections();
    await this.buildIndexes();
    await this.warmupCache();
  }
}
```

### 2. 知识检索流程

```typescript
class RAGRetriever {
  async retrieve(query: string, options: RetrieveOptions) {
    // 1. 生成查询向量
    const queryVector = await this.embedding.embed(query);

    // 2. 执行向量检索
    const results = await this.vectorStore.search({
      collection: options.collection,
      vector: queryVector,
      limit: options.limit,
      filter: options.filter
    });

    // 3. 后处理结果
    return this.processResults(results, options);
  }
}
```

### 3. 内容生成流程

```typescript
class RAGGenerator {
  async generate(query: string, context: string[]) {
    // 1. 构建提示词
    const prompt = this.buildPrompt(query, context);

    // 2. 生成内容
    const completion = await this.llm.complete(prompt);

    // 3. 后处理
    return this.postProcess(completion);
  }
}
```

## 开发状态

### 1. 已完成功能 [25%]

1. 基础设施 [90%]
   - 向量数据库集成完成
   - 文本嵌入服务就绪
   - 检索服务基本实现
   - 错误处理机制已建立

2. 核心功能
   - RAG服务基础类实现
   - Milvus向量存储集成
   - OpenAI嵌入模型集成
   - 基础测试用例编写

### 2. 进行中功能

1. 知识库管理
   - 数据采集系统
   - 内容处理管道
   - 质量控制机制
   - 更新策略实现

2. 检索优化
   - 相关度算法
   - 结果排序
   - 缓存策略
   - 性能调优

### 3. 待开发功能

1. 高级特性
   - 多知识源融合
   - 动态知识更新
   - 个性化检索
   - 协同过滤

2. 系统优化
   - 分布式部署
   - 负载均衡
   - 监控告警
   - 容灾备份

## 使用指南

### 1. 环境配置

```bash
# 安装依赖
npm install @zilliz/milvus2-sdk-node

# 配置环境变量
ZILLIZ_CLOUD_URI=your_uri
ZILLIZ_CLOUD_TOKEN=your_token
```

### 2. 基础用法

```typescript
// 初始化服务
const ragService = new RAGService({
  milvus: {
    uri: process.env.ZILLIZ_CLOUD_URI,
    token: process.env.ZILLIZ_CLOUD_TOKEN
  },
  embedding: {
    model: 'deepseek-base'
  }
});

// 检索知识
const results = await ragService.search({
  query: "如何设计反转结局",
  collection: "plot_patterns",
  limit: 5
});
```

### 3. 高级功能

```typescript
// 知识库更新
await ragService.updateKnowledge({
  type: KnowledgeType.PLOT_PATTERN,
  content: "新的剧情模式...",
  metadata: {
    category: "反转",
    tags: ["悬疑", "推理"]
  }
});

// 批量检索
const batchResults = await ragService.batchSearch({
  queries: ["设计反转", "人物动机"],
  collections: ["plot_patterns", "character_design"],
  limit: 3
});
```

## 注意事项

1. 性能考虑
   - 向量维度选择
   - 索引参数调优
   - 批量处理优化
   - 缓存策略

2. 数据质量
   - 内容审核
   - 重复检测
   - 版本控制
   - 定期更新

3. 系统维护
   - 监控指标
   - 日志记录
   - 备份策略
   - 故障恢复

## 后续规划

1. 短期目标
   - 完善知识库内容
   - 优化检索质量
   - 提升响应速度
   - 增加测试覆盖

2. 中期目标
   - 实现分布式部署
   - 支持多数据源
   - 添加缓存层
   - 优化资源使用

3. 长期目标
   - 智能知识更新
   - 自适应检索
   - 知识图谱集成
   - API服务化 