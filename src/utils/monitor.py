import time
import psutil
import threading
from typing import Dict, Any, Optional
from datetime import datetime
from .logger import default_logger

class SystemMonitor:
    def __init__(self, 
                 interval: int = 60,  # 监控间隔（秒）
                 cpu_threshold: float = 80.0,  # CPU使用率警告阈值
                 memory_threshold: float = 80.0,  # 内存使用率警告阈值
                 disk_threshold: float = 80.0):  # 磁盘使用率警告阈值
        """初始化系统监控器
        
        Args:
            interval: 监控间隔时间（秒）
            cpu_threshold: CPU使用率警告阈值（百分比）
            memory_threshold: 内存使用率警告阈值（百分比）
            disk_threshold: 磁盘使用率警告阈值（百分比）
        """
        self.interval = interval
        self.cpu_threshold = cpu_threshold
        self.memory_threshold = memory_threshold
        self.disk_threshold = disk_threshold
        self.running = False
        self.monitor_thread = None
        self.metrics: Dict[str, Any] = {}
    
    def start(self):
        """启动监控"""
        if not self.running:
            self.running = True
            self.monitor_thread = threading.Thread(target=self._monitor_loop)
            self.monitor_thread.daemon = True
            self.monitor_thread.start()
            default_logger.info("System monitor started")
    
    def stop(self):
        """停止监控"""
        self.running = False
        if self.monitor_thread:
            self.monitor_thread.join()
            default_logger.info("System monitor stopped")
    
    def _monitor_loop(self):
        """监控循环"""
        while self.running:
            try:
                self._collect_metrics()
                self._check_thresholds()
                time.sleep(self.interval)
            except Exception as e:
                default_logger.error(f"Error in monitor loop: {str(e)}")
    
    def _collect_metrics(self):
        """收集系统指标"""
        try:
            # CPU使用率
            cpu_percent = psutil.cpu_percent(interval=1)
            
            # 内存使用情况
            memory = psutil.virtual_memory()
            memory_percent = memory.percent
            
            # 磁盘使用情况
            disk = psutil.disk_usage('/')
            disk_percent = disk.percent
            
            # 系统负载
            load_avg = psutil.getloadavg()
            
            # 网络IO
            net_io = psutil.net_io_counters()
            
            # 更新指标
            self.metrics = {
                'timestamp': datetime.now().isoformat(),
                'cpu': {
                    'percent': cpu_percent,
                    'count': psutil.cpu_count()
                },
                'memory': {
                    'total': memory.total,
                    'available': memory.available,
                    'used': memory.used,
                    'percent': memory_percent
                },
                'disk': {
                    'total': disk.total,
                    'used': disk.used,
                    'free': disk.free,
                    'percent': disk_percent
                },
                'load_average': {
                    '1min': load_avg[0],
                    '5min': load_avg[1],
                    '15min': load_avg[2]
                },
                'network': {
                    'bytes_sent': net_io.bytes_sent,
                    'bytes_recv': net_io.bytes_recv,
                    'packets_sent': net_io.packets_sent,
                    'packets_recv': net_io.packets_recv
                }
            }
        except Exception as e:
            default_logger.error(f"Error collecting metrics: {str(e)}")
    
    def _check_thresholds(self):
        """检查阈值并发出警告"""
        if not self.metrics:
            return
        
        # 检查CPU使用率
        if self.metrics['cpu']['percent'] > self.cpu_threshold:
            default_logger.warning(
                f"High CPU usage: {self.metrics['cpu']['percent']}% "
                f"(threshold: {self.cpu_threshold}%)"
            )
        
        # 检查内存使用率
        if self.metrics['memory']['percent'] > self.memory_threshold:
            default_logger.warning(
                f"High memory usage: {self.metrics['memory']['percent']}% "
                f"(threshold: {self.memory_threshold}%)"
            )
        
        # 检查磁盘使用率
        if self.metrics['disk']['percent'] > self.disk_threshold:
            default_logger.warning(
                f"High disk usage: {self.metrics['disk']['percent']}% "
                f"(threshold: {self.disk_threshold}%)"
            )
    
    def get_metrics(self) -> Dict[str, Any]:
        """获取当前系统指标
        
        Returns:
            系统指标数据
        """
        return self.metrics

# 创建默认监控器实例
default_monitor = SystemMonitor() 