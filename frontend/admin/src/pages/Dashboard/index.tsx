import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Alert } from 'antd';
import { SearchOutlined, CheckCircleOutlined, SyncOutlined, WarningOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import moment from 'moment';
import { searchService } from '@/services/search';
import { monitorService } from '@/services/monitor';
import { alertService } from '@/services/alert';
import { usePolling } from '@/hooks/usePolling';

interface DashboardProps {}

const Dashboard: React.FC<DashboardProps> = () => {
  // 性能指标
  const [metrics, setMetrics] = useState({
    averageQueryTime: 0,
    cacheHitRate: 0,
    slowQueryCount: 0,
    totalQueries: 0,
  });

  // 热门查询
  const [popularQueries, setPopularQueries] = useState<Array<{
    query: string;
    count: number;
    avgTime: number;
    timestamp: number;
  }>>([]);

  // 告警历史
  const [alerts, setAlerts] = useState<Array<{
    id: string;
    message: string;
    severity: string;
    timestamp: number;
  }>>([]);

  // 系统状态
  const [systemStatus, setSystemStatus] = useState({
    elasticsearch: false,
    milvus: false,
    redis: false,
  });

  // 轮询获取数据
  usePolling(async () => {
    try {
      const [metricsData, queriesData, alertsData, statusData] = await Promise.all([
        monitorService.getPerformanceMetrics(),
        monitorService.getPopularQueries(),
        alertService.getAlerts({ startTime: Date.now() - 24 * 60 * 60 * 1000 }),
        searchService.getSystemStatus(),
      ]);

      setMetrics(metricsData);
      setPopularQueries(queriesData);
      setAlerts(alertsData);
      setSystemStatus(statusData);
    } catch (error) {
      console.error('获取监控数据失败:', error);
    }
  }, 30000); // 30秒更新一次

  // 查询时间趋势图配置
  const queryTimeChartOption = {
    title: {
      text: '查询时间趋势',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'time',
      axisLabel: {
        formatter: (value: number) => moment(value).format('HH:mm'),
      },
    },
    yAxis: {
      type: 'value',
      name: '查询时间(ms)',
    },
    series: [{
      name: '平均查询时间',
      type: 'line',
      smooth: true,
      data: popularQueries.map(q => [q.timestamp, q.avgTime]),
    }],
  };

  // 缓存命中率图表配置
  const cacheHitChartOption = {
    title: {
      text: '缓存命中率',
      left: 'center',
    },
    tooltip: {
      formatter: '{b}: {c}%',
    },
    series: [{
      type: 'gauge',
      detail: { formatter: '{value}%' },
      data: [{ value: (metrics.cacheHitRate * 100).toFixed(1) }],
    }],
  };

  // 告警表格列配置
  const alertColumns = [
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp: number) => moment(timestamp).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '级别',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity: string) => {
        const color = {
          info: 'blue',
          warning: 'orange',
          error: 'red',
          critical: 'purple',
        }[severity] || 'default';
        return <Tag color={color}>{severity.toUpperCase()}</Tag>;
      },
    },
    {
      title: '消息',
      dataIndex: 'message',
      key: 'message',
    },
  ];

  return (
    <div className="dashboard">
      {/* 系统状态 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={24}>
          <Alert
            message="系统状态"
            description={
              <Row gutter={16}>
                <Col span={8}>
                  <Tag icon={systemStatus.elasticsearch ? <CheckCircleOutlined /> : <WarningOutlined />} color={systemStatus.elasticsearch ? 'success' : 'error'}>
                    Elasticsearch {systemStatus.elasticsearch ? '正常' : '异常'}
                  </Tag>
                </Col>
                <Col span={8}>
                  <Tag icon={systemStatus.milvus ? <CheckCircleOutlined /> : <WarningOutlined />} color={systemStatus.milvus ? 'success' : 'error'}>
                    Milvus {systemStatus.milvus ? '正常' : '异常'}
                  </Tag>
                </Col>
                <Col span={8}>
                  <Tag icon={systemStatus.redis ? <CheckCircleOutlined /> : <WarningOutlined />} color={systemStatus.redis ? 'success' : 'error'}>
                    Redis {systemStatus.redis ? '正常' : '异常'}
                  </Tag>
                </Col>
              </Row>
            }
            type="info"
            showIcon
          />
        </Col>
      </Row>

      {/* 性能指标 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均查询时间"
              value={metrics.averageQueryTime}
              suffix="ms"
              prefix={<SearchOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="缓存命中率"
              value={(metrics.cacheHitRate * 100).toFixed(1)}
              suffix="%"
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="慢查询数"
              value={metrics.slowQueryCount}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总查询数"
              value={metrics.totalQueries}
              prefix={<SyncOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 图表 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={16}>
          <Card title="查询时间趋势">
            <ReactECharts option={queryTimeChartOption} style={{ height: 300 }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="缓存命中率">
            <ReactECharts option={cacheHitChartOption} style={{ height: 300 }} />
          </Card>
        </Col>
      </Row>

      {/* 告警历史 */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="告警历史">
            <Table
              columns={alertColumns}
              dataSource={alerts}
              rowKey="id"
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 