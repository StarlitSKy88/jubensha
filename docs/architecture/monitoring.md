## 监控指标
### 关键业务指标
- 剧本生成成功率
- 平均响应时间（P50/P95/P99）
- 知识库检索命中率

### 系统指标
```grafana
sum(rate(http_request_duration_seconds_count[5m])) by (service)
``` 