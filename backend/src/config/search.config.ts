/**
 * 搜索性能优化配置
 */
export const searchConfig = {
  // 缓存配置
  cache: {
    // 搜索结果缓存时间（秒）
    ttl: 3600,
    // 向量缓存时间（秒）
    vectorTtl: 86400,
    // 是否启用缓存预热
    enablePrewarm: true,
    // 缓存预热的关键词数量
    prewarmKeywordsCount: 100,
  },

  // Elasticsearch 优化
  elasticsearch: {
    // 索引设置
    index: {
      // 分片数
      numberOfShards: 5,
      // 副本数
      numberOfReplicas: 1,
      // 刷新间隔
      refreshInterval: '1s',
    },
    // 查询设置
    query: {
      // 最小相关性分数
      minScore: 0.1,
      // 模糊匹配参数
      fuzziness: 'AUTO',
      // 最大展开查询词数
      maxExpansions: 50,
      // 字段权重
      fieldBoosts: {
        title: 2,
        content: 1,
        tags: 1.5,
      },
    },
    // 高亮设置
    highlight: {
      // 最大高亮片段数
      numberOfFragments: 3,
      // 每个片段大小
      fragmentSize: 150,
      // 高亮标签
      preTags: ['<em>'],
      postTags: ['</em>'],
    },
  },

  // Milvus 优化
  milvus: {
    // 索引类型
    indexType: 'IVF_FLAT',
    // 度量类型
    metricType: 'L2',
    // 索引参数
    indexParams: {
      nlist: 1024,
    },
    // 搜索参数
    searchParams: {
      nprobe: 16,
      ef: 64,
    },
  },

  // 混合搜索配置
  hybrid: {
    // 文本搜索权重
    textSearchWeight: 0.6,
    // 向量搜索权重
    vectorSearchWeight: 0.4,
    // 是否启用并行搜索
    enableParallelSearch: true,
    // 是否启用自适应权重
    enableAdaptiveWeights: true,
  },

  // 批处理配置
  batch: {
    // 批量处理大小
    size: 32,
    // 并发数
    concurrency: 3,
    // 重试次数
    retries: 3,
    // 重试延迟（毫秒）
    retryDelay: 1000,
  },

  // 性能监控
  monitoring: {
    // 是否启用性能监控
    enabled: true,
    // 慢查询阈值（毫秒）
    slowQueryThreshold: 1000,
    // 是否记录查询统计
    enableQueryStats: true,
    // 是否记录缓存统计
    enableCacheStats: true,
  },
} as const; 