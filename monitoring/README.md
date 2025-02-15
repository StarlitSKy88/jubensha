# 监控系统目录

本目录包含项目的监控系统配置。

## 目录结构

```
monitoring/
├── grafana/           # Grafana配置
│   ├── dashboards/    # 仪表板配置
│   └── datasources/   # 数据源配置
└── prometheus/        # Prometheus配置
    ├── rules/         # 告警规则
    └── targets/       # 监控目标
```

## 监控组件

### Grafana
- 可视化监控数据
- 配置告警通知
- 自定义仪表板

### Prometheus
- 时序数据采集
- 监控指标存储
- 告警规则管理

## 监控指标

1. 系统指标
   - CPU使用率
   - 内存使用
   - 磁盘使用
   - 网络流量

2. 应用指标
   - 请求延迟
   - 错误率
   - QPS
   - 并发连接数

3. 业务指标
   - 用户活跃度
   - API调用量
   - 任务处理量
   - 资源使用率

## 告警配置

1. 系统告警
   - CPU > 80%
   - 内存 > 85%
   - 磁盘 > 90%
   - 服务不可用

2. 应用告警
   - 错误率 > 1%
   - 延迟 > 500ms
   - 队列堆积
   - 连接异常

## 使用说明

1. 访问监控面板：
```
Grafana: http://localhost:3000
Prometheus: http://localhost:9090
```

2. 默认账号：
```
Grafana: admin/admin
```

## 注意事项

1. 定期检查监控系统状态
2. 及时处理告警信息
3. 定期备份监控数据
4. 及时更新监控规则 