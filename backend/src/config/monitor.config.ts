import { config } from 'dotenv';

config();

export const monitorConfig = {
  // API性能监控阈值
  api: {
    slowThreshold: 1000, // 慢API阈值(ms)
    timeout: 30000,     // 超时阈值(ms)
    maxMemory: 1024,    // 最大内存使用(MB)
    maxCpu: 80         // 最大CPU使用率(%)
  },

  // 错误监控配置
  error: {
    maxErrors: 100,     // 最大错误数/分钟
    maxWarnings: 1000,  // 最大警告数/分钟
    alertThreshold: 50  // 错误告警阈值
  },

  // 系统资源监控
  system: {
    checkInterval: 60000,  // 检查间隔(ms)
    memoryThreshold: 80,   // 内存使用告警阈值(%)
    cpuThreshold: 70,      // CPU使用告警阈值(%)
    diskThreshold: 85      // 磁盘使用告警阈值(%)
  },

  // 告警配置
  alert: {
    enabled: true,
    channels: ['email', 'slack'],
    cooldown: 300000  // 告警冷却时间(ms)
  }
}; 