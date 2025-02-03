import { searchConfig } from '../config/search.config';
import { logger } from '../utils/logger';

interface QueryStats {
  query: string;
  took: number;
  timestamp: number;
  cacheHit: boolean;
  resultCount: number;
  filters?: Record<string, any>;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  lastCleanup: number;
}

class SearchMonitorService {
  private queryStats: QueryStats[] = [];
  private cacheStats: CacheStats = {
    hits: 0,
    misses: 0,
    size: 0,
    lastCleanup: Date.now(),
  };

  private readonly maxStatsSize = 1000;
  private readonly cleanupInterval = 3600000; // 1小时

  /**
   * 记录查询统计
   */
  recordQueryStats(stats: QueryStats): void {
    if (!searchConfig.monitoring.enabled || !searchConfig.monitoring.enableQueryStats) {
      return;
    }

    this.queryStats.push(stats);

    // 检查是否为慢查询
    if (stats.took > searchConfig.monitoring.slowQueryThreshold) {
      logger.warn('检测到慢查询:', {
        query: stats.query,
        took: stats.took,
        filters: stats.filters,
      });
    }

    // 限制统计数据大小
    if (this.queryStats.length > this.maxStatsSize) {
      this.queryStats = this.queryStats.slice(-this.maxStatsSize);
    }
  }

  /**
   * 记录缓存命中
   */
  recordCacheHit(size: number): void {
    if (!searchConfig.monitoring.enabled || !searchConfig.monitoring.enableCacheStats) {
      return;
    }

    this.cacheStats.hits++;
    this.cacheStats.size = size;
    this.checkCleanup();
  }

  /**
   * 记录缓存未命中
   */
  recordCacheMiss(): void {
    if (!searchConfig.monitoring.enabled || !searchConfig.monitoring.enableCacheStats) {
      return;
    }

    this.cacheStats.misses++;
    this.checkCleanup();
  }

  /**
   * 获取查询统计
   */
  getQueryStats(options: {
    startTime?: number;
    endTime?: number;
    minDuration?: number;
  } = {}): QueryStats[] {
    const { startTime, endTime, minDuration } = options;
    
    return this.queryStats.filter(stat => {
      const timeMatch = (!startTime || stat.timestamp >= startTime) &&
                       (!endTime || stat.timestamp <= endTime);
      const durationMatch = !minDuration || stat.took >= minDuration;
      return timeMatch && durationMatch;
    });
  }

  /**
   * 获取缓存统计
   */
  getCacheStats(): CacheStats {
    return { ...this.cacheStats };
  }

  /**
   * 获取性能指标
   */
  getPerformanceMetrics(): {
    averageQueryTime: number;
    cacheHitRate: number;
    slowQueryCount: number;
    totalQueries: number;
  } {
    const totalQueries = this.queryStats.length;
    if (totalQueries === 0) {
      return {
        averageQueryTime: 0,
        cacheHitRate: 0,
        slowQueryCount: 0,
        totalQueries: 0,
      };
    }

    const totalTime = this.queryStats.reduce((sum, stat) => sum + stat.took, 0);
    const slowQueries = this.queryStats.filter(
      stat => stat.took > searchConfig.monitoring.slowQueryThreshold
    );
    const cacheHitRate = this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses) || 0;

    return {
      averageQueryTime: totalTime / totalQueries,
      cacheHitRate,
      slowQueryCount: slowQueries.length,
      totalQueries,
    };
  }

  /**
   * 获取热门查询
   */
  getPopularQueries(limit: number = 10): Array<{
    query: string;
    count: number;
    avgTime: number;
  }> {
    const queryMap = new Map<string, { count: number; totalTime: number }>();

    this.queryStats.forEach(stat => {
      const existing = queryMap.get(stat.query) || { count: 0, totalTime: 0 };
      queryMap.set(stat.query, {
        count: existing.count + 1,
        totalTime: existing.totalTime + stat.took,
      });
    });

    return Array.from(queryMap.entries())
      .map(([query, { count, totalTime }]) => ({
        query,
        count,
        avgTime: totalTime / count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * 清理过期统计数据
   */
  private checkCleanup(): void {
    const now = Date.now();
    if (now - this.cacheStats.lastCleanup >= this.cleanupInterval) {
      // 清理超过24小时的查询统计
      const oneDayAgo = now - 86400000;
      this.queryStats = this.queryStats.filter(stat => stat.timestamp >= oneDayAgo);
      
      // 重置缓存统计
      this.cacheStats = {
        hits: 0,
        misses: 0,
        size: this.cacheStats.size,
        lastCleanup: now,
      };

      logger.info('已清理过期的监控数据');
    }
  }
}

export const searchMonitorService = new SearchMonitorService(); 