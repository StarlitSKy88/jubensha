from fastapi import Request
from prometheus_client import Counter, Histogram, Gauge
import time
from typing import Callable
from utils.logger import get_logger

# 获取日志记录器
logger = get_logger(__name__)

# 定义指标
REQUEST_COUNT = Counter(
    'http_request_count',
    'HTTP Request Count',
    ['method', 'endpoint', 'status']
)

REQUEST_LATENCY = Histogram(
    'http_request_latency_seconds',
    'HTTP Request Latency',
    ['method', 'endpoint']
)

REQUESTS_IN_PROGRESS = Gauge(
    'http_requests_in_progress',
    'HTTP Requests In Progress',
    ['method', 'endpoint']
)

RESPONSE_SIZE = Histogram(
    'http_response_size_bytes',
    'HTTP Response Size',
    ['method', 'endpoint']
)

ERROR_COUNT = Counter(
    'http_request_errors',
    'HTTP Request Errors',
    ['method', 'endpoint', 'error_type']
)

class MetricsMiddleware:
    """性能监控中间件"""
    def __init__(self):
        self.logger = logger

    async def __call__(
        self,
        request: Request,
        call_next: Callable
    ):
        """处理请求并记录指标"""
        method = request.method
        path = request.url.path
        
        # 记录进行中的请求
        REQUESTS_IN_PROGRESS.labels(method=method, endpoint=path).inc()
        
        # 记录请求开始时间
        start_time = time.time()
        
        try:
            # 处理请求
            response = await call_next(request)
            
            # 记录请求延迟
            latency = time.time() - start_time
            REQUEST_LATENCY.labels(method=method, endpoint=path).observe(latency)
            
            # 记录请求计数
            REQUEST_COUNT.labels(
                method=method,
                endpoint=path,
                status=response.status_code
            ).inc()
            
            # 记录响应大小
            response_size = len(response.body) if hasattr(response, 'body') else 0
            RESPONSE_SIZE.labels(method=method, endpoint=path).observe(response_size)
            
            # 记录慢请求
            if latency > 1.0:  # 超过1秒的请求
                self.logger.warning(
                    f"慢请求: {method} {path}",
                    {
                        "latency": latency,
                        "status_code": response.status_code,
                        "response_size": response_size
                    }
                )
            
            return response
            
        except Exception as e:
            # 记录错误
            ERROR_COUNT.labels(
                method=method,
                endpoint=path,
                error_type=type(e).__name__
            ).inc()
            
            self.logger.error(
                f"请求错误: {method} {path}",
                {
                    "error_type": type(e).__name__,
                    "error_message": str(e)
                }
            )
            raise
            
        finally:
            # 减少进行中的请求计数
            REQUESTS_IN_PROGRESS.labels(method=method, endpoint=path).dec()

def setup_metrics(app):
    """设置性能监控中间件"""
    app.add_middleware(MetricsMiddleware) 