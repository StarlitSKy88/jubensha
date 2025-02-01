"""日志配置模块."""
import logging
import sys
from typing import Any, Dict

from loguru import logger

from scriptai.config import settings


class InterceptHandler(logging.Handler):
    """Loguru拦截处理器."""

    def emit(self, record: logging.LogRecord) -> None:
        """发送日志记录."""
        try:
            level = logger.level(record.levelname).name
        except ValueError:
            level = record.levelno

        frame, depth = logging.currentframe(), 2
        while frame.f_code.co_filename == logging.__file__:
            frame = frame.f_back  # type: ignore
            depth += 1

        logger.opt(depth=depth, exception=record.exc_info).log(
            level,
            record.getMessage(),
        )


def setup_logging(
    *,
    level: str = settings.LOG_LEVEL,
    **kwargs: Dict[str, Any],
) -> None:
    """配置日志."""
    # 移除所有处理器
    logging.root.handlers = []

    # 配置loguru
    logger.configure(
        handlers=[
            {
                "sink": sys.stdout,
                "level": level,
                "format": (
                    "<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | "
                    "<level>{level: <8}</level> | "
                    "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
                    "<level>{message}</level>"
                ),
            },
            {
                "sink": "logs/scriptai.log",
                "rotation": "00:00",
                "compression": "zip",
                "retention": "30 days",
                "level": level,
                "format": (
                    "{time:YYYY-MM-DD HH:mm:ss.SSS} | "
                    "{level: <8} | "
                    "{name}:{function}:{line} | "
                    "{message}"
                ),
            },
        ],
        **kwargs,
    )

    # 拦截标准库日志
    logging.basicConfig(handlers=[InterceptHandler()], level=0, force=True)

    # 设置第三方库日志级别
    for name in logging.root.manager.loggerDict:
        logging.getLogger(name).handlers = []
        logging.getLogger(name).propagate = True

    logger.info("日志系统初始化完成") 