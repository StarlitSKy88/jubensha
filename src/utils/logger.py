import logging
import os
from datetime import datetime
from logging.handlers import RotatingFileHandler, TimedRotatingFileHandler

class Logger:
    def __init__(self, 
                 name: str,
                 log_dir: str = "logs",
                 level: int = logging.INFO,
                 max_bytes: int = 10 * 1024 * 1024,  # 10MB
                 backup_count: int = 5):
        """初始化日志记录器
        
        Args:
            name: 日志记录器名称
            log_dir: 日志存储目录
            level: 日志级别
            max_bytes: 单个日志文件最大大小
            backup_count: 保留的日志文件数量
        """
        self.name = name
        self.log_dir = log_dir
        self.level = level
        self.max_bytes = max_bytes
        self.backup_count = backup_count
        
        # 创建日志目录
        os.makedirs(log_dir, exist_ok=True)
        
        # 创建日志记录器
        self.logger = logging.getLogger(name)
        self.logger.setLevel(level)
        
        # 设置日志格式
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        
        # 添加控制台处理器
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(formatter)
        self.logger.addHandler(console_handler)
        
        # 添加文件处理器（按大小轮转）
        file_handler = RotatingFileHandler(
            os.path.join(log_dir, f"{name}.log"),
            maxBytes=max_bytes,
            backupCount=backup_count,
            encoding='utf-8'
        )
        file_handler.setFormatter(formatter)
        self.logger.addHandler(file_handler)
        
        # 添加每日轮转处理器
        daily_handler = TimedRotatingFileHandler(
            os.path.join(log_dir, f"{name}_daily.log"),
            when='midnight',
            interval=1,
            backupCount=backup_count,
            encoding='utf-8'
        )
        daily_handler.setFormatter(formatter)
        self.logger.addHandler(daily_handler)
    
    def debug(self, message: str):
        """记录调试信息"""
        self.logger.debug(message)
    
    def info(self, message: str):
        """记录一般信息"""
        self.logger.info(message)
    
    def warning(self, message: str):
        """记录警告信息"""
        self.logger.warning(message)
    
    def error(self, message: str):
        """记录错误信息"""
        self.logger.error(message)
    
    def critical(self, message: str):
        """记录严重错误信息"""
        self.logger.critical(message)
    
    def exception(self, message: str):
        """记录异常信息，包含堆栈跟踪"""
        self.logger.exception(message)

# 创建默认日志记录器
default_logger = Logger("jubensha") 