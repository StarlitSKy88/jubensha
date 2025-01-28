from fastapi import Request, status
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError
from typing import Union, Dict, Any
import logging
import traceback

# 配置日志
logger = logging.getLogger(__name__)

class AppError(Exception):
    """应用错误基类"""
    def __init__(
        self,
        message: str,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        details: Union[Dict[str, Any], None] = None
    ):
        self.message = message
        self.status_code = status_code
        self.details = details
        super().__init__(message)

class AuthenticationError(AppError):
    """认证错误"""
    def __init__(self, message: str = "认证失败"):
        super().__init__(
            message=message,
            status_code=status.HTTP_401_UNAUTHORIZED
        )

class AuthorizationError(AppError):
    """授权错误"""
    def __init__(self, message: str = "没有权限"):
        super().__init__(
            message=message,
            status_code=status.HTTP_403_FORBIDDEN
        )

class ValidationError(AppError):
    """验证错误"""
    def __init__(self, message: str = "数据验证失败", details: Dict[str, Any] = None):
        super().__init__(
            message=message,
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            details=details
        )

class NotFoundError(AppError):
    """资源不存在错误"""
    def __init__(self, message: str = "资源不存在"):
        super().__init__(
            message=message,
            status_code=status.HTTP_404_NOT_FOUND
        )

class DatabaseError(AppError):
    """数据库错误"""
    def __init__(self, message: str = "数据库操作失败"):
        super().__init__(
            message=message,
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

async def error_handler(request: Request, call_next):
    """错误处理中间件"""
    try:
        return await call_next(request)
    except AppError as e:
        # 处理应用自定义错误
        logger.warning(
            f"应用错误: {e.message}",
            extra={
                "status_code": e.status_code,
                "details": e.details,
                "path": request.url.path
            }
        )
        return JSONResponse(
            status_code=e.status_code,
            content={
                "message": e.message,
                "details": e.details
            }
        )
    except SQLAlchemyError as e:
        # 处理数据库错误
        logger.error(
            f"数据库错误: {str(e)}",
            extra={
                "traceback": traceback.format_exc(),
                "path": request.url.path
            }
        )
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "message": "数据库操作失败",
                "details": None
            }
        )
    except Exception as e:
        # 处理其他未知错误
        logger.error(
            f"未知错误: {str(e)}",
            extra={
                "traceback": traceback.format_exc(),
                "path": request.url.path
            }
        )
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "message": "服务器内部错误",
                "details": None
            }
        )

def setup_error_handler(app):
    """设置错误处理中间件"""
    app.middleware("http")(error_handler) 