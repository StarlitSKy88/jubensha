"""健康检查相关的API端点."""
from typing import Any

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from scriptai.core.redis import redis_client
from scriptai.db.session import get_db

router = APIRouter()


@router.get("/health", status_code=status.HTTP_200_OK)
async def health_check() -> dict[str, str]:
    """基础健康检查."""
    return {"status": "ok"}


@router.get("/health/db", status_code=status.HTTP_200_OK)
async def db_health_check(db: AsyncSession = Depends(get_db)) -> dict[str, str]:
    """数据库健康检查."""
    try:
        # 执行简单查询
        await db.execute("SELECT 1")
        return {"status": "ok"}
    except Exception as e:
        return {
            "status": "error",
            "detail": str(e),
        }


@router.get("/health/redis", status_code=status.HTTP_200_OK)
async def redis_health_check() -> dict[str, str]:
    """Redis健康检查."""
    try:
        # 执行PING命令
        await redis_client.client.ping()
        return {"status": "ok"}
    except Exception as e:
        return {
            "status": "error",
            "detail": str(e),
        }


@router.get("/health/all", status_code=status.HTTP_200_OK)
async def all_health_check(
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """全面健康检查."""
    health = {
        "status": "ok",
        "services": {},
    }

    # 检查数据库
    try:
        await db.execute("SELECT 1")
        health["services"]["database"] = {"status": "ok"}
    except Exception as e:
        health["status"] = "error"
        health["services"]["database"] = {
            "status": "error",
            "detail": str(e),
        }

    # 检查Redis
    try:
        await redis_client.client.ping()
        health["services"]["redis"] = {"status": "ok"}
    except Exception as e:
        health["status"] = "error"
        health["services"]["redis"] = {
            "status": "error",
            "detail": str(e),
        }

    return health 