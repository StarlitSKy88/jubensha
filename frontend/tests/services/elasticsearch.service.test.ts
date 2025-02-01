import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ElasticsearchService, type ElasticsearchConfig } from '@/services/elasticsearch.service'
import type { PerformanceMetric } from '@/utils/performance'

describe('Elasticsearch Service', () => {
  let service: ElasticsearchService
  let mockFetch: ReturnType<typeof vi.fn>
  
  beforeEach(() => {
    // 模拟fetch
    mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ result: 'success' })
    })
    global.fetch = mockFetch
    
    // 创建服务实例
    service = new ElasticsearchService({
      endpoint: 'http://elasticsearch:9200',
      index: 'performance-metrics',
      auth: {
        username: 'elastic',
        password: 'password'
      }
    })
  })

  describe('Metrics Indexing', () => {
    it('should index metrics correctly', async () => {
      const metrics: PerformanceMetric[] = [
        {
          type: 'frontend.loadTime',
          value: 100,
          timestamp: Date.now()
        }
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ errors: false })
      })

      await service.indexMetrics(metrics)

      expect(mockFetch).toHaveBeenCalledWith(
        'http://elasticsearch:9200/performance-metrics/_bulk',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/x-ndjson',
            'Authorization': expect.stringContaining('Basic')
          })
        })
      )

      const requestBody = mockFetch.mock.calls[0][1].body as string
      expect(requestBody).toContain('"type":"frontend.loadTime"')
      expect(requestBody).toContain('"value":100')
    })

    it('should handle empty metrics array', async () => {
      await service.indexMetrics([])
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should handle bulk indexing errors', async () => {
      const metrics: PerformanceMetric[] = [
        {
          type: 'frontend.loadTime',
          value: 100,
          timestamp: Date.now()
        }
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          errors: true,
          items: [
            {
              index: {
                error: {
                  reason: 'mapping error'
                }
              }
            }
          ]
        })
      })

      await expect(service.indexMetrics(metrics)).rejects.toThrow('Bulk indexing failed')
    })
  })

  describe('Metrics Search', () => {
    it('should search metrics with options', async () => {
      const searchResult = {
        hits: {
          hits: [
            {
              _source: {
                type: 'frontend.loadTime',
                value: 100,
                '@timestamp': '2024-03-28T00:00:00Z'
              }
            }
          ]
        }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(searchResult)
      })

      const options = {
        startTime: Date.now() - 3600000,
        endTime: Date.now(),
        metricTypes: ['frontend.loadTime'],
        limit: 10,
        sort: 'desc' as const
      }

      const results = await service.searchMetrics(options)

      expect(mockFetch).toHaveBeenCalledWith(
        'http://elasticsearch:9200/performance-metrics/_search',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"type.keyword":["frontend.loadTime"]')
        })
      )

      expect(results).toHaveLength(1)
      expect(results[0].type).toBe('frontend.loadTime')
      expect(results[0].value).toBe(100)
    })

    it('should handle search errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Search error'
      })

      await expect(service.searchMetrics()).rejects.toThrow('Elasticsearch error')
    })
  })

  describe('Metrics Aggregation', () => {
    it('should aggregate metrics with options', async () => {
      const aggregationResult = {
        aggregations: {
          time_buckets: {
            buckets: [
              {
                key_as_string: '2024-03-28T00:00:00Z',
                key: 1711584000000,
                doc_count: 10,
                loadTime_avg: {
                  value: 150
                }
              }
            ]
          }
        }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(aggregationResult)
      })

      const options = {
        interval: '1h',
        metrics: ['loadTime'],
        aggregations: ['avg']
      }

      const results = await service.aggregateMetrics(options)

      expect(mockFetch).toHaveBeenCalledWith(
        'http://elasticsearch:9200/performance-metrics/_search',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"fixed_interval":"1h"')
        })
      )

      expect(results).toEqual(aggregationResult.aggregations)
    })
  })

  describe('Data Cleanup', () => {
    it('should delete old metrics', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ deleted: 100 })
      })

      await service.deleteOldMetrics(7)

      expect(mockFetch).toHaveBeenCalledWith(
        'http://elasticsearch:9200/performance-metrics/_delete_by_query',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"lt":')
        })
      )
    })
  })

  describe('Authentication', () => {
    it('should use API key authentication', async () => {
      const service = new ElasticsearchService({
        endpoint: 'http://elasticsearch:9200',
        index: 'performance-metrics',
        auth: {
          apiKey: 'test-api-key'
        }
      })

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ result: 'success' })
      })

      await service.searchMetrics()

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'ApiKey test-api-key'
          })
        })
      )
    })

    it('should use basic authentication', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ result: 'success' })
      })

      await service.searchMetrics()

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': expect.stringContaining('Basic')
          })
        })
      )
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(service.searchMetrics()).rejects.toThrow('Network error')
    })

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error'
      })

      await expect(service.searchMetrics()).rejects.toThrow('Elasticsearch error')
    })
  })
}) 