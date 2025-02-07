from typing import Dict, Any, Optional
from fastapi import HTTPException
from .logger import default_logger

class AppError(Exception):
    """应用程序错误基类"""
    def __init__(self, 
                 message: str,
                 code: str = "UNKNOWN_ERROR",
                 status_code: int = 500,
                 details: Optional[Dict[str, Any]] = None):
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)

class ValidationError(AppError):
    """数据验证错误"""
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            code="VALIDATION_ERROR",
            status_code=400,
            details=details
        )

class NotFoundError(AppError):
    """资源不存在错误"""
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            code="NOT_FOUND",
            status_code=404,
            details=details
        )

class AuthorizationError(AppError):
    """授权错误"""
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            code="AUTHORIZATION_ERROR",
            status_code=401,
            details=details
        )

class ErrorHandler:
    """错误处理器"""
    @staticmethod
    def handle(error: Exception) -> Dict[str, Any]:
        """处理错误
        
        Args:
            error: 异常对象
            
        Returns:
            错误响应数据
        """
        # 记录错误日志
        default_logger.error(f"Error occurred: {str(error)}")
        if isinstance(error, AppError):
            default_logger.error(f"Error details: {error.details}")
        
        # 处理应用程序错误
        if isinstance(error, AppError):
            raise HTTPException(
                status_code=error.status_code,
                detail={
                    "code": error.code,
                    "message": error.message,
                    "details": error.details
                }
            )
        
        # 处理HTTP异常
        if isinstance(error, HTTPException):
            return {
                "code": "HTTP_ERROR",
                "message": str(error.detail),
                "status_code": error.status_code
            }
        
        # 处理其他异常
        return {
            "code": "INTERNAL_ERROR",
            "message": "服务器内部错误",
            "status_code": 500
        }

    @staticmethod
    def validation_error(message: str, details: Optional[Dict[str, Any]] = None) -> None:
        """抛出数据验证错误
        
        Args:
            message: 错误信息
            details: 错误详情
        """
        raise ValidationError(message, details)

    @staticmethod
    def not_found_error(message: str, details: Optional[Dict[str, Any]] = None) -> None:
        """抛出资源不存在错误
        
        Args:
            message: 错误信息
            details: 错误详情
        """
        raise NotFoundError(message, details)

    @staticmethod
    def authorization_error(message: str, details: Optional[Dict[str, Any]] = None) -> None:
        """抛出授权错误
        
        Args:
            message: 错误信息
            details: 错误详情
        """
        raise AuthorizationError(message, details) 