import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GrafanaService, type GrafanaConfig } from '@/services/grafana.service'

describe('Grafana Service', () => {
  let service: GrafanaService
  let mockFetch: ReturnType<typeof vi.fn>
  
  beforeEach(() => {
    // 模拟fetch
    mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ result: 'success' })
    })
    global.fetch = mockFetch
    
    // 创建服务实例
    service = new GrafanaService({
      endpoint: 'http://grafana:3000',
      apiKey: 'test-api-key',
      dataSource: {
        type: 'prometheus',
        uid: 'prometheus',
        name: 'Prometheus'
      }
    })
  })

  describe('Data Source Management', () => {
    it('should create data source', async () => {
      await service.createDataSource()

      expect(mockFetch).toHaveBeenCalledWith(
        'http://grafana:3000/api/datasources',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-api-key'
          }),
          body: expect.stringContaining('"type":"prometheus"')
        })
      )
    })

    it('should handle data source creation error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Data source already exists'
      })

      await expect(service.createDataSource()).rejects.toThrow('Grafana API error')
    })
  })

  describe('Dashboard Management', () => {
    it('should create dashboard', async () => {
      const config = {
        title: 'Test Dashboard',
        uid: 'test-dashboard',
        panels: [
          {
            title: 'Test Panel',
            type: 'graph',
            targets: [
              {
                refId: 'A',
                expr: 'test_metric',
                legendFormat: '{{label}}'
              }
            ]
          }
        ]
      }

      await service.createDashboard(config)

      expect(mockFetch).toHaveBeenCalledWith(
        'http://grafana:3000/api/dashboards/db',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"title":"Test Dashboard"')
        })
      )
    })

    it('should update dashboard', async () => {
      const service = new GrafanaService({
        endpoint: 'http://grafana:3000',
        apiKey: 'test-api-key',
        dataSource: {
          type: 'prometheus',
          uid: 'prometheus',
          name: 'Prometheus'
        },
        dashboard: {
          uid: 'test-dashboard'
        }
      })

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            dashboard: {
              title: 'Test Dashboard',
              panels: []
            }
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ result: 'success' })
        })

      const panels = [
        {
          title: 'Updated Panel',
          type: 'graph',
          targets: [
            {
              refId: 'A',
              expr: 'updated_metric'
            }
          ]
        }
      ]

      await service.updateDashboard(panels)

      expect(mockFetch).toHaveBeenCalledWith(
        'http://grafana:3000/api/dashboards/db',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"title":"Updated Panel"')
        })
      )
    })

    it('should get dashboard', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          dashboard: {
            title: 'Test Dashboard',
            uid: 'test-dashboard'
          }
        })
      })

      const dashboard = await service.getDashboard('test-dashboard')

      expect(dashboard).toEqual({
        title: 'Test Dashboard',
        uid: 'test-dashboard'
      })
    })

    it('should handle dashboard not found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Dashboard not found'
      })

      await expect(service.getDashboard('non-existent')).rejects.toThrow('Grafana API error')
    })
  })

  describe('Performance Dashboard', () => {
    it('should create performance dashboard', async () => {
      await service.createPerformanceDashboard()

      expect(mockFetch).toHaveBeenCalledWith(
        'http://grafana:3000/api/dashboards/db',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"title":"性能监控仪表盘"')
        })
      )

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(requestBody.dashboard.panels).toHaveLength(3)
      expect(requestBody.dashboard.panels[0].title).toBe('前端性能指标')
      expect(requestBody.dashboard.panels[1].title).toBe('资源使用')
      expect(requestBody.dashboard.panels[2].title).toBe('稳定性指标')
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(service.createDataSource()).rejects.toThrow('Network error')
    })

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error'
      })

      await expect(service.createDataSource()).rejects.toThrow('Grafana API error')
    })

    it('should handle invalid data source type', () => {
      const service = new GrafanaService({
        endpoint: 'http://grafana:3000',
        apiKey: 'test-api-key',
        dataSource: {
          type: 'invalid' as any,
          uid: 'invalid',
          name: 'Invalid'
        }
      })

      expect(() => service['getDataSourceUrl']()).toThrow('Unsupported data source type')
    })
  })

  describe('Organization Support', () => {
    it('should include organization header when specified', async () => {
      const service = new GrafanaService({
        endpoint: 'http://grafana:3000',
        apiKey: 'test-api-key',
        organization: 'test-org',
        dataSource: {
          type: 'prometheus',
          uid: 'prometheus',
          name: 'Prometheus'
        }
      })

      await service.createDataSource()

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Grafana-Org-Id': 'test-org'
          })
        })
      )
    })
  })
}) 