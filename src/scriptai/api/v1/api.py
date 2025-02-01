"""API路由注册."""
from fastapi import APIRouter

from .auth import router as auth_router
from .users import router as users_router
from .roles import router as roles_router
from .websocket import router as websocket_router

# 创建API路由
api_router = APIRouter()

# 注册认证路由
api_router.include_router(
    auth_router,
    prefix="/auth",
    tags=["认证"]
)

# 注册用户路由
api_router.include_router(
    users_router,
    prefix="/users",
    tags=["用户管理"]
)

# 注册角色路由
api_router.include_router(
    roles_router,
    prefix="/roles",
    tags=["角色管理"]
)

# 注册WebSocket路由
api_router.include_router(
    websocket_router,
    prefix="/ws",
    tags=["WebSocket"]
) 