import { logger } from '../utils/logger';
import { searchMonitorService } from './search-monitor.service';

interface AlertRule {
  id: string;
  name: string;
  type: 'performance' | 'error' | 'security';
  condition: {
    metric: string;
    operator: '>' | '<' | '==' | '>=' | '<=';
    threshold: number;
  };
  severity: 'info' | 'warning' | 'error' | 'critical';
  enabled: boolean;
  notificationChannels: string[];
}

interface Alert {
  id: string;
  ruleId: string;
  timestamp: number;
  message: string;
  severity: string;
  metric: string;
  value: number;
  threshold: number;
}

class AlertService {
  private rules: AlertRule[] = [];
  private alerts: Alert[] = [];
  private readonly maxAlertsSize = 1000;
  private readonly checkInterval = 60000; // 1分钟
  private checkTimer: NodeJS.Timer | null = null;

  constructor() {
    // 初始化默认告警规则
    this.initializeDefaultRules();
    // 启动告警检查
    this.startMonitoring();
  }

  /**
   * 初始化默认告警规则
   */
  private initializeDefaultRules(): void {
    this.addRule({
      id: 'slow-query',
      name: '慢查询告警',
      type: 'performance',
      condition: {
        metric: 'averageQueryTime',
        operator: '>',
        threshold: 1000, // 1秒
      },
      severity: 'warning',
      enabled: true,
      notificationChannels: ['log', 'email'],
    });

    this.addRule({
      id: 'low-cache-hit',
      name: '缓存命中率过低',
      type: 'performance',
      condition: {
        metric: 'cacheHitRate',
        operator: '<',
        threshold: 0.5, // 50%
      },
      severity: 'warning',
      enabled: true,
      notificationChannels: ['log'],
    });

    this.addRule({
      id: 'high-error-rate',
      name: '错误率过高',
      type: 'error',
      condition: {
        metric: 'errorRate',
        operator: '>',
        threshold: 0.05, // 5%
      },
      severity: 'error',
      enabled: true,
      notificationChannels: ['log', 'email', 'slack'],
    });
  }

  /**
   * 添加告警规则
   */
  addRule(rule: AlertRule): void {
    const existingRule = this.rules.find(r => r.id === rule.id);
    if (existingRule) {
      Object.assign(existingRule, rule);
    } else {
      this.rules.push(rule);
    }
  }

  /**
   * 删除告警规则
   */
  removeRule(ruleId: string): void {
    this.rules = this.rules.filter(rule => rule.id !== ruleId);
  }

  /**
   * 启用/禁用告警规则
   */
  toggleRule(ruleId: string, enabled: boolean): void {
    const rule = this.rules.find(r => r.id === ruleId);
    if (rule) {
      rule.enabled = enabled;
    }
  }

  /**
   * 获取告警规则
   */
  getRules(): AlertRule[] {
    return [...this.rules];
  }

  /**
   * 获取告警历史
   */
  getAlerts(options: {
    startTime?: number;
    endTime?: number;
    severity?: string;
    type?: string;
  } = {}): Alert[] {
    const { startTime, endTime, severity, type } = options;
    
    return this.alerts.filter(alert => {
      const timeMatch = (!startTime || alert.timestamp >= startTime) &&
                       (!endTime || alert.timestamp <= endTime);
      const severityMatch = !severity || alert.severity === severity;
      const typeMatch = !type || this.rules.find(r => r.id === alert.ruleId)?.type === type;
      return timeMatch && severityMatch && typeMatch;
    });
  }

  /**
   * 启动监控
   */
  private startMonitoring(): void {
    if (this.checkTimer) {
      return;
    }

    this.checkTimer = setInterval(async () => {
      await this.checkAlerts();
    }, this.checkInterval) as unknown as NodeJS.Timer;
  }

  /**
   * 停止监控
   */
  stopMonitoring(): void {
    if (this.checkTimer) {
      clearInterval(this.checkTimer as unknown as number);
      this.checkTimer = null;
    }
  }

  /**
   * 检查告警条件
   */
  private async checkAlerts(): Promise<void> {
    try {
      const metrics = searchMonitorService.getPerformanceMetrics();

      this.rules.forEach(rule => {
        if (!rule.enabled) return;

        const value = metrics[rule.condition.metric as keyof typeof metrics];
        if (typeof value !== 'number') return;

        const triggered = this.evaluateCondition(rule.condition, value);
        if (triggered) {
          this.createAlert(rule, value);
        }
      });

      // 限制告警历史大小
      if (this.alerts.length > this.maxAlertsSize) {
        this.alerts = this.alerts.slice(-this.maxAlertsSize);
      }
    } catch (error) {
      logger.error('告警检查失败:', error);
    }
  }

  /**
   * 评估告警条件
   */
  private evaluateCondition(
    condition: AlertRule['condition'],
    value: number
  ): boolean {
    switch (condition.operator) {
      case '>':
        return value > condition.threshold;
      case '<':
        return value < condition.threshold;
      case '>=':
        return value >= condition.threshold;
      case '<=':
        return value <= condition.threshold;
      case '==':
        return value === condition.threshold;
      default:
        return false;
    }
  }

  /**
   * 创建告警
   */
  private createAlert(rule: AlertRule, value: number): void {
    const alert: Alert = {
      id: `${Date.now()}-${rule.id}`,
      ruleId: rule.id,
      timestamp: Date.now(),
      message: `${rule.name}: ${rule.condition.metric} ${rule.condition.operator} ${rule.condition.threshold} (当前值: ${value})`,
      severity: rule.severity,
      metric: rule.condition.metric,
      value,
      threshold: rule.condition.threshold,
    };

    this.alerts.push(alert);
    this.notifyAlert(alert, rule.notificationChannels);
  }

  /**
   * 发送告警通知
   */
  private notifyAlert(alert: Alert, channels: string[]): void {
    channels.forEach(channel => {
      switch (channel) {
        case 'log':
          this.logAlert(alert);
          break;
        case 'email':
          this.sendEmailAlert(alert);
          break;
        case 'slack':
          this.sendSlackAlert(alert);
          break;
        default:
          logger.warn(`未知的通知渠道: ${channel}`);
      }
    });
  }

  /**
   * 记录告警日志
   */
  private logAlert(alert: Alert): void {
    const logMethod = {
      info: (message: string, ...args: any[]) => logger.info(message, ...args),
      warning: (message: string, ...args: any[]) => logger.warn(message, ...args),
      error: (message: string, ...args: any[]) => logger.error(message, ...args),
      critical: (message: string, ...args: any[]) => logger.error(message, ...args),
    }[alert.severity] || ((message: string, ...args: any[]) => logger.info(message, ...args));

    logMethod('监控告警:', {
      message: alert.message,
      severity: alert.severity,
      metric: alert.metric,
      value: alert.value,
      threshold: alert.threshold,
      timestamp: new Date(alert.timestamp).toISOString(),
    });
  }

  /**
   * 发送邮件告警
   */
  private sendEmailAlert(alert: Alert): void {
    // TODO: 实现邮件发送
    logger.info('发送邮件告警:', alert);
  }

  /**
   * 发送Slack告警
   */
  private sendSlackAlert(alert: Alert): void {
    // TODO: 实现Slack通知
    logger.info('发送Slack告警:', alert);
  }
}

export const alertService = new AlertService(); 