import logging
import logging.handlers
import os
import yaml
from datetime import datetime
from typing import Dict, Any

def setup_logging(config_path: str = "config/config.yaml") -> None:
    """设置日志系统"""
    # 加载配置
    with open(config_path, "r") as f:
        config = yaml.safe_load(f)

    # 创建日志目录
    log_dir = "logs"
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)

    # 配置根日志记录器
    logging.config.dictConfig(config["logging"])

    # 添加自定义字段
    old_factory = logging.getLogRecordFactory()

    def record_factory(*args, **kwargs):
        record = old_factory(*args, **kwargs)
        record.timestamp = datetime.utcnow().isoformat()
        record.hostname = os.uname().nodename
        return record

    logging.setLogRecordFactory(record_factory)

class CustomLogger:
    """自定义日志记录器"""
    def __init__(self, name: str):
        self.logger = logging.getLogger(name)

    def _log(self, level: int, message: str, extra: Dict[str, Any] = None) -> None:
        """记录日志"""
        if extra is None:
            extra = {}
        
        # 添加默认字段
        extra.update({
            "service": self.logger.name,
            "timestamp": datetime.utcnow().isoformat()
        })
        
        self.logger.log(level, message, extra=extra)

    def debug(self, message: str, extra: Dict[str, Any] = None) -> None:
        """记录调试日志"""
        self._log(logging.DEBUG, message, extra)

    def info(self, message: str, extra: Dict[str, Any] = None) -> None:
        """记录信息日志"""
        self._log(logging.INFO, message, extra)

    def warning(self, message: str, extra: Dict[str, Any] = None) -> None:
        """记录警告日志"""
        self._log(logging.WARNING, message, extra)

    def error(self, message: str, extra: Dict[str, Any] = None) -> None:
        """记录错误日志"""
        self._log(logging.ERROR, message, extra)

    def critical(self, message: str, extra: Dict[str, Any] = None) -> None:
        """记录严重错误日志"""
        self._log(logging.CRITICAL, message, extra)

def get_logger(name: str) -> CustomLogger:
    """获取日志记录器"""
    return CustomLogger(name)

# 示例用法
# logger = get_logger(__name__)
# logger.info("这是一条信息日志", {"user_id": "123", "action": "login"})
# logger.error("这是一条错误日志", {"error_code": "500", "details": "数据库连接失败"}) 