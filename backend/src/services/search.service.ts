import { Client } from '@elastic/elasticsearch';
import { MilvusClient } from '@zilliz/milvus2-sdk-node';
import { config } from '../config';
import { searchConfig } from '../config/search.config';
import { logger } from '../utils/logger';
import { cacheService } from './cache.service';
import { vectorService } from './vector.service';
import { searchMonitorService } from './search-monitor.service';

export interface SearchOptions {
  query: string;
  filters?: Record<string, any>;
  page?: number;
  limit?: number;
  useCache?: boolean;
  vectorSearch?: boolean;
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  took: number;
}

class SearchService {
  private readonly esClient: Client;
  private readonly milvusClient: MilvusClient;
  private readonly cachePrefix = 'search:';
  private readonly cacheTTL: number;

  constructor() {
    // 初始化 Elasticsearch 客户端
    this.esClient = new Client({
      node: config.elasticsearch.node,
      auth: config.elasticsearch.auth,
    });

    // 初始化 Milvus 客户端
    this.milvusClient = new MilvusClient({
      address: config.milvus.address,
      username: config.milvus.username,
      password: config.milvus.password,
      ssl: config.milvus.ssl,
    });

    this.cacheTTL = searchConfig.cache.ttl;

    this.initializeClients().catch(err => {
      logger.error('搜索服务初始化失败:', err);
    });
  }

  private async initializeClients(): Promise<void> {
    try {
      // 检查 Elasticsearch 连接
      await this.esClient.ping();
      logger.info('Elasticsearch 连接成功');

      // 检查 Milvus 连接
      await this.milvusClient.checkHealth();
      logger.info('Milvus 连接成功');

      // 初始化 Elasticsearch 索引设置
      await this.initializeElasticsearchIndex();
    } catch (error) {
      logger.error('搜索服务初始化错误:', error);
      throw error;
    }
  }

  /**
   * 初始化 Elasticsearch 索引设置
   */
  private async initializeElasticsearchIndex(): Promise<void> {
    const indexExists = await this.esClient.indices.exists({ index: 'knowledge' });
    
    if (!indexExists) {
      await this.esClient.indices.create({
        index: 'knowledge',
        body: {
          settings: {
            number_of_shards: searchConfig.elasticsearch.index.numberOfShards,
            number_of_replicas: searchConfig.elasticsearch.index.numberOfReplicas,
            refresh_interval: searchConfig.elasticsearch.index.refreshInterval,
          },
          mappings: {
            properties: {
              title: { type: 'text', analyzer: 'ik_max_word', boost: 2 },
              content: { type: 'text', analyzer: 'ik_smart' },
              tags: { type: 'keyword', boost: 1.5 },
              createdAt: { type: 'date' },
              updatedAt: { type: 'date' },
            },
          },
        },
      });
      logger.info('Elasticsearch 索引创建成功');
    }
  }

  /**
   * 混合搜索：结合关键词搜索和向量搜索
   */
  async hybridSearch<T extends { id: string }>(options: SearchOptions): Promise<SearchResult<T>> {
    const startTime = Date.now();
    const cacheKey = this.getCacheKey(options);
    
    try {
      // 检查缓存
      if (options.useCache) {
        const cached = await cacheService.get<SearchResult<T>>(cacheKey);
        if (cached) {
          searchMonitorService.recordCacheHit(1);
          searchMonitorService.recordQueryStats({
            query: options.query,
            took: Date.now() - startTime,
            timestamp: startTime,
            cacheHit: true,
            resultCount: cached.total,
            filters: options.filters,
          });
          return cached;
        }
        searchMonitorService.recordCacheMiss();
      }

      let items: T[] = [];
      let total = 0;

      if (searchConfig.hybrid.enableParallelSearch && options.vectorSearch) {
        // 并行执行文本搜索和向量搜索
        const [textResults, vectorResults] = await Promise.all([
          this.textSearch<T>(options),
          this.vectorSearch<T>(options),
        ]);

        items = this.mergeResults(textResults.items, vectorResults.items);
        total = Math.max(textResults.total, vectorResults.total);
      } else {
        // 串行执行搜索
        const textResults = await this.textSearch<T>(options);
        
        if (options.vectorSearch) {
          const vectorResults = await this.vectorSearch<T>(options);
          items = this.mergeResults(textResults.items, vectorResults.items);
          total = Math.max(textResults.total, vectorResults.total);
        } else {
          items = textResults.items;
          total = textResults.total;
        }
      }

      const result: SearchResult<T> = {
        items,
        total,
        page: options.page || 1,
        limit: options.limit || 10,
        took: Date.now() - startTime,
      };

      // 缓存结果
      if (options.useCache) {
        await cacheService.set(cacheKey, result, this.cacheTTL);
      }

      // 记录查询统计
      searchMonitorService.recordQueryStats({
        query: options.query,
        took: result.took,
        timestamp: startTime,
        cacheHit: false,
        resultCount: total,
        filters: options.filters,
      });

      return result;
    } catch (error) {
      logger.error('混合搜索失败:', error);
      throw error;
    }
  }

  /**
   * 文本搜索
   */
  private async textSearch<T>(options: SearchOptions): Promise<SearchResult<T>> {
    try {
      const { body } = await this.esClient.search({
        index: 'knowledge',
        body: {
          query: {
            bool: {
              must: [
                {
                  multi_match: {
                    query: options.query,
                    fields: Object.entries(searchConfig.elasticsearch.query.fieldBoosts)
                      .map(([field, boost]) => `${field}^${boost}`),
                    fuzziness: searchConfig.elasticsearch.query.fuzziness,
                    max_expansions: searchConfig.elasticsearch.query.maxExpansions,
                  },
                },
              ],
              filter: this.buildFilters(options.filters),
            },
          },
          min_score: searchConfig.elasticsearch.query.minScore,
          from: ((options.page || 1) - 1) * (options.limit || 10),
          size: options.limit || 10,
          highlight: {
            fields: {
              title: {
                number_of_fragments: searchConfig.elasticsearch.highlight.numberOfFragments,
                fragment_size: searchConfig.elasticsearch.highlight.fragmentSize,
              },
              content: {
                number_of_fragments: searchConfig.elasticsearch.highlight.numberOfFragments,
                fragment_size: searchConfig.elasticsearch.highlight.fragmentSize,
              },
            },
            pre_tags: searchConfig.elasticsearch.highlight.preTags,
            post_tags: searchConfig.elasticsearch.highlight.postTags,
          },
        },
      });

      return {
        items: body.hits.hits.map((hit: any) => ({
          ...hit._source,
          score: hit._score,
          highlights: hit.highlight,
        })) as T[],
        total: body.hits.total.value,
        page: options.page || 1,
        limit: options.limit || 10,
        took: body.took,
      };
    } catch (error) {
      logger.error('文本搜索失败:', error);
      throw error;
    }
  }

  /**
   * 向量搜索
   */
  private async vectorSearch<T>(options: SearchOptions): Promise<SearchResult<T>> {
    try {
      const collection = config.milvus.collection;
      const topK = options.limit || 10;
      
      const searchResponse = await this.milvusClient.search({
        collection_name: collection,
        vector: await this.textToVector(options.query),
        limit: topK,
        params: {
          ...searchConfig.milvus.searchParams,
          ...this.buildMilvusParams(options.filters),
        },
      });

      return {
        items: searchResponse.results as T[],
        total: searchResponse.results.length,
        page: options.page || 1,
        limit: options.limit || 10,
        took: 0,
      };
    } catch (error) {
      logger.error('向量搜索失败:', error);
      throw error;
    }
  }

  /**
   * 将文本转换为向量
   */
  private async textToVector(text: string): Promise<number[]> {
    try {
      return await vectorService.textToVector(text, {
        useCache: true,
        batchSize: searchConfig.batch.size,
      });
    } catch (error) {
      logger.error('文本向量化失败:', error);
      throw error;
    }
  }

  /**
   * 构建 Elasticsearch 过滤条件
   */
  private buildFilters(filters?: Record<string, any>): any[] {
    if (!filters) return [];
    return Object.entries(filters).map(([field, value]) => ({
      term: { [field]: value },
    }));
  }

  /**
   * 构建 Milvus 查询参数
   */
  private buildMilvusParams(filters?: Record<string, any>): Record<string, any> {
    if (!filters) return {};
    return filters;
  }

  /**
   * 合并并排序搜索结果
   */
  private mergeResults<T extends { id: string; score?: number }>(
    textResults: T[],
    vectorResults: T[]
  ): T[] {
    // 创建结果映射，用于去重和合并分数
    const resultMap = new Map<string, T & { combinedScore: number }>();

    // 处理文本搜索结果
    textResults.forEach((result, index) => {
      const textScore = result.score || 1 - index / textResults.length;
      resultMap.set(result.id, {
        ...result,
        combinedScore: textScore * searchConfig.hybrid.textSearchWeight,
      });
    });

    // 处理向量搜索结果
    vectorResults.forEach((result, index) => {
      const vectorScore = result.score || 1 - index / vectorResults.length;
      const existing = resultMap.get(result.id);

      if (existing) {
        // 如果结果已存在，合并分数
        existing.combinedScore += vectorScore * searchConfig.hybrid.vectorSearchWeight;
      } else {
        // 如果结果不存在，添加新结果
        resultMap.set(result.id, {
          ...result,
          combinedScore: vectorScore * searchConfig.hybrid.vectorSearchWeight,
        });
      }
    });

    // 转换为数组并排序
    return Array.from(resultMap.values())
      .sort((a, b) => b.combinedScore - a.combinedScore)
      .map(({ combinedScore, ...rest }) => ({
        ...rest,
        score: combinedScore,  // 保留组合分数作为最终分数
      }) as unknown as T);
  }

  /**
   * 生成缓存键
   */
  private getCacheKey(options: SearchOptions): string {
    return `${this.cachePrefix}${JSON.stringify(options)}`;
  }
}

export const searchService = new SearchService(); 