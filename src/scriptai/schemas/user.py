"""用户相关的数据模型."""
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr

from .role import RoleResponse


class UserBase(BaseModel):
    """用户基础模型."""

    username: str
    email: EmailStr
    is_active: bool = True
    is_superuser: bool = False


class UserCreate(UserBase):
    """用户创建模型."""

    password: str
    role_ids: Optional[List[str]] = None


class UserUpdate(BaseModel):
    """用户更新模型."""

    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None


class UserRoleUpdate(BaseModel):
    """用户角色更新模型."""

    role_ids: List[str]


class UserResponse(UserBase):
    """用户响应模型."""

    id: str
    last_login: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    roles: List[RoleResponse]

    class Config:
        """配置."""

        from_attributes = True 