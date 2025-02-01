## 日志规范
### 日志级别
- DEBUG: 开发调试信息
- INFO: 关键业务流程
- WARN: 可恢复的异常
- ERROR: 需要干预的错误

### 日志格式示例
```log
{
  "timestamp": "2024-03-21T09:30:00Z",
  "level": "ERROR",
  "service": "script-generator",
  "trace_id": "abc123",
  "error_code": "10000101",
  "message": "Invalid access token",
  "metadata": {
    "user_id": "u123",
    "ip": "192.168.1.1"
  }
}
``` 