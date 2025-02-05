import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';

export interface PerformanceMetrics {
  averageQueryTime: number;
  cacheHitRate: number;
  slowQueryCount: number;
  totalQueries: number;
}

export interface PopularQuery {
  query: string;
  count: number;
  avgTime: number;
  timestamp: number;
}

export const monitorService = {
  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    const response = await axios.get(`${API_BASE_URL}/api/monitor/metrics`);
    return response.data;
  },

  async getPopularQueries(limit: number = 10): Promise<PopularQuery[]> {
    const response = await axios.get(`${API_BASE_URL}/api/monitor/popular-queries`, {
      params: { limit },
    });
    return response.data.map((query: PopularQuery) => ({
      ...query,
      timestamp: Date.now(), // 添加时间戳用于图表展示
    }));
  },
}; 