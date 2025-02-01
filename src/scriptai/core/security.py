"""安全相关的工具函数."""
from datetime import datetime, timedelta
from functools import wraps
from typing import Any, Callable, List, Optional, Union

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession

from scriptai.config import settings
from scriptai.db.session import get_db
from scriptai.models.user import User

# 密码加密上下文
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login",
)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """验证密码.
    
    Args:
        plain_password: 明文密码
        hashed_password: 哈希密码
        
    Returns:
        如果密码匹配返回True，否则返回False
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """获取密码哈希.
    
    Args:
        password: 明文密码
        
    Returns:
        密码哈希值
    """
    return pwd_context.hash(password)


def create_access_token(
    data: dict[str, Any],
    expires_delta: Union[timedelta, None] = None,
) -> str:
    """创建访问令牌."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES,
        )
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm="HS256",
    )
    return encoded_jwt


async def get_current_user(
    db: AsyncSession = Depends(get_db),
    token: str = Depends(oauth2_scheme),
) -> User:
    """获取当前用户."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="无法验证凭据",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=["HS256"],
        )
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = await User.get_by_email(db, email=email)
    if user is None:
        raise credentials_exception
    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """获取当前活跃用户."""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="用户未激活",
        )
    return current_user


async def get_current_active_superuser(
    current_user: User = Depends(get_current_user),
) -> User:
    """获取当前活跃的超级用户."""
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="权限不足",
        )
    return current_user


def require_permissions(
    permissions: Union[str, List[str]],
    require_all: bool = True
) -> Callable:
    """权限检查装饰器.
    
    Args:
        permissions: 所需权限名称或列表
        require_all: 是否需要满足所有权限
        
    Returns:
        装饰器函数
    """
    if isinstance(permissions, str):
        permissions = [permissions]
        
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, current_user: User = Depends(), **kwargs):
            if not current_user.is_active:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="用户未激活"
                )
                
            if current_user.is_superuser:
                return await func(*args, current_user=current_user, **kwargs)
                
            if require_all:
                # 需要满足所有权限
                has_permissions = all(
                    current_user.has_permission(permission)
                    for permission in permissions
                )
            else:
                # 满足任一权限即可
                has_permissions = any(
                    current_user.has_permission(permission)
                    for permission in permissions
                )
                
            if not has_permissions:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="权限不足"
                )
                
            return await func(*args, current_user=current_user, **kwargs)
            
        return wrapper
        
    return decorator


def require_roles(
    roles: Union[str, List[str]],
    require_all: bool = True
) -> Callable:
    """角色检查装饰器.
    
    Args:
        roles: 所需角色名称或列表
        require_all: 是否需要满足所有角色
        
    Returns:
        装饰器函数
    """
    if isinstance(roles, str):
        roles = [roles]
        
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, current_user: User = Depends(), **kwargs):
            if not current_user.is_active:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="用户未激活"
                )
                
            if current_user.is_superuser:
                return await func(*args, current_user=current_user, **kwargs)
                
            if require_all:
                # 需要满足所有角色
                has_roles = all(
                    current_user.has_role(role)
                    for role in roles
                )
            else:
                # 满足任一角色即可
                has_roles = any(
                    current_user.has_role(role)
                    for role in roles
                )
                
            if not has_roles:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="角色权限不足"
                )
                
            return await func(*args, current_user=current_user, **kwargs)
            
        return wrapper
        
    return decorator 