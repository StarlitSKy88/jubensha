"""应用工厂函数模块."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import make_asgi_app

from scriptai.api.v1.api import api_router
from scriptai.config import settings
from scriptai.core.logging import setup_logging
from scriptai.core.middleware import setup_middleware
from scriptai.core.openai import openai_client
from scriptai.core.redis import redis_client
from scriptai.services.rag.service import rag_service


def create_app() -> FastAPI:
    """创建FastAPI应用实例."""
    # 配置日志
    setup_logging()

    # 创建应用
    app = FastAPI(
        title=settings.PROJECT_NAME,
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        docs_url=f"{settings.API_V1_STR}/docs",
        redoc_url=f"{settings.API_V1_STR}/redoc",
    )

    # 配置CORS
    if settings.BACKEND_CORS_ORIGINS:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    # 配置中间件
    setup_middleware(app)

    # 添加Prometheus指标端点
    metrics_app = make_asgi_app()
    app.mount("/metrics", metrics_app)

    # 注册路由
    app.include_router(api_router, prefix=settings.API_V1_STR)

    @app.on_event("startup")
    async def startup_event() -> None:
        """应用启动时的事件处理."""
        await redis_client.init()
        await rag_service.initialize()

    @app.on_event("shutdown")
    async def shutdown_event() -> None:
        """应用关闭时的事件处理."""
        await redis_client.close()
        await openai_client.close()
        await rag_service.close()

    return app 