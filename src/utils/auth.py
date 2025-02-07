from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import jwt
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from .error_handler import AuthorizationError
from .logger import default_logger

class Role:
    ADMIN = "admin"
    USER = "user"
    GUEST = "guest"

class Permission:
    READ = "read"
    WRITE = "write"
    DELETE = "delete"
    MANAGE = "manage"

class AuthManager:
    def __init__(self, 
                 secret_key: str,
                 token_expire_minutes: int = 60 * 24):  # 24小时
        """初始化认证管理器
        
        Args:
            secret_key: JWT密钥
            token_expire_minutes: token过期时间（分钟）
        """
        self.secret_key = secret_key
        self.token_expire_minutes = token_expire_minutes
        self.security = HTTPBearer()
        
        # 角色权限映射
        self.role_permissions = {
            Role.ADMIN: [Permission.READ, Permission.WRITE, Permission.DELETE, Permission.MANAGE],
            Role.USER: [Permission.READ, Permission.WRITE],
            Role.GUEST: [Permission.READ]
        }
    
    def create_token(self, 
                    user_id: str,
                    role: str = Role.USER,
                    extra_claims: Optional[Dict[str, Any]] = None) -> str:
        """创建JWT token
        
        Args:
            user_id: 用户ID
            role: 用户角色
            extra_claims: 额外的声明信息
            
        Returns:
            JWT token字符串
        """
        expire = datetime.utcnow() + timedelta(minutes=self.token_expire_minutes)
        claims = {
            "sub": user_id,
            "role": role,
            "exp": expire
        }
        if extra_claims:
            claims.update(extra_claims)
            
        try:
            token = jwt.encode(claims, self.secret_key, algorithm="HS256")
            default_logger.info(f"Created token for user {user_id} with role {role}")
            return token
        except Exception as e:
            default_logger.error(f"Token creation failed: {str(e)}")
            raise AuthorizationError("Token creation failed")
    
    def verify_token(self, credentials: HTTPAuthorizationCredentials = Security(HTTPBearer())) -> Dict[str, Any]:
        """验证JWT token
        
        Args:
            credentials: HTTP认证凭证
            
        Returns:
            token声明信息
        """
        try:
            token = credentials.credentials
            claims = jwt.decode(token, self.secret_key, algorithms=["HS256"])
            return claims
        except jwt.ExpiredSignatureError:
            default_logger.warning("Token expired")
            raise AuthorizationError("Token has expired")
        except jwt.InvalidTokenError as e:
            default_logger.error(f"Invalid token: {str(e)}")
            raise AuthorizationError("Invalid token")
    
    def check_permission(self, token_claims: Dict[str, Any], required_permission: str) -> bool:
        """检查权限
        
        Args:
            token_claims: token声明信息
            required_permission: 所需权限
            
        Returns:
            是否有权限
        """
        role = token_claims.get("role")
        if not role or role not in self.role_permissions:
            return False
        
        return required_permission in self.role_permissions[role]
    
    def require_permission(self, required_permission: str):
        """权限要求装饰器
        
        Args:
            required_permission: 所需权限
        """
        def decorator(func):
            async def wrapper(*args, **kwargs):
                credentials = kwargs.get("credentials")
                if not credentials:
                    raise AuthorizationError("No credentials provided")
                
                claims = self.verify_token(credentials)
                if not self.check_permission(claims, required_permission):
                    raise AuthorizationError(f"Permission denied: {required_permission} required")
                
                return await func(*args, **kwargs)
            return wrapper
        return decorator

# 创建默认认证管理器
default_auth_manager = AuthManager(
    secret_key="your-secret-key-here",  # 在生产环境中应该使用环境变量
    token_expire_minutes=60 * 24  # 24小时
) 