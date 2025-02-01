"""中间件模块."""
import time
from typing import Awaitable, Callable

from fastapi import FastAPI, Request, Response
from loguru import logger
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint

from scriptai.core import metrics


class PrometheusMiddleware(BaseHTTPMiddleware):
    """Prometheus监控中间件."""

    def __init__(self, app: FastAPI) -> None:
        """初始化中间件."""
        super().__init__(app)

    async def dispatch(
        self,
        request: Request,
        call_next: RequestResponseEndpoint,
    ) -> Response:
        """处理请求."""
        method = request.method
        path = request.url.path
        begin_time = time.time()

        try:
            response = await call_next(request)
            status = response.status_code
            metrics.http_requests_total.labels(
                method=method,
                endpoint=path,
                status=status,
            ).inc()
        except Exception as e:
            status = 500
            metrics.http_requests_total.labels(
                method=method,
                endpoint=path,
                status=status,
            ).inc()
            raise e from None
        finally:
            end_time = time.time()
            metrics.http_request_duration_seconds.labels(
                method=method,
                endpoint=path,
            ).observe(end_time - begin_time)

        return response


class LoggingMiddleware(BaseHTTPMiddleware):
    """日志中间件."""

    def __init__(self, app: FastAPI) -> None:
        """初始化中间件."""
        super().__init__(app)

    async def dispatch(
        self,
        request: Request,
        call_next: RequestResponseEndpoint,
    ) -> Response:
        """处理请求."""
        begin_time = time.time()
        response = await call_next(request)
        end_time = time.time()

        logger.info(
            f"{request.method} {request.url.path} "
            f"[{response.status_code}] "
            f"{end_time - begin_time:.3f}s",
        )

        return response


def setup_middleware(app: FastAPI) -> None:
    """配置中间件."""
    app.add_middleware(PrometheusMiddleware)
    app.add_middleware(LoggingMiddleware) 