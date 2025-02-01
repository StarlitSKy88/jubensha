"""用户相关模型."""
from typing import Any, Dict, Optional, List
from datetime import datetime
import uuid

from sqlalchemy import Boolean, DateTime, String
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from scriptai.core.security import get_password_hash, verify_password
from scriptai.db.base_class import Base
from .role import Role, user_roles
from .profile import UserProfile, UserSettings


class User(Base):
    """用户模型."""

    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(128), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    last_login: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now(),
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )

    # 关系
    roles: Mapped[List[Role]] = relationship(
        "Role",
        secondary=user_roles,
        lazy="joined"
    )
    profile: Mapped[UserProfile] = relationship(
        "UserProfile",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan"
    )
    settings: Mapped[UserSettings] = relationship(
        "UserSettings",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan"
    )

    @classmethod
    async def get_by_email(cls, db: AsyncSession, *, email: str) -> Optional["User"]:
        """根据邮箱获取用户."""
        result = await db.execute(
            cls.__table__.select().where(cls.email == email),
        )
        return result.scalar_one_or_none()

    @classmethod
    async def get_by_username(
        cls,
        db: AsyncSession,
        *,
        username: str,
    ) -> Optional["User"]:
        """根据用户名获取用户."""
        result = await db.execute(
            cls.__table__.select().where(cls.username == username),
        )
        return result.scalar_one_or_none()

    @classmethod
    async def create(cls, db: AsyncSession, *, obj_in: Dict[str, Any]) -> "User":
        """创建用户."""
        db_obj = cls(
            email=obj_in["email"],
            username=obj_in["username"],
            password_hash=get_password_hash(obj_in["password"]),
            is_active=obj_in.get("is_active", True),
            is_superuser=obj_in.get("is_superuser", False),
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    @classmethod
    async def update(
        cls,
        db: AsyncSession,
        *,
        db_obj: "User",
        obj_in: Dict[str, Any],
    ) -> "User":
        """更新用户."""
        update_data = obj_in.copy()
        if "password" in update_data:
            hashed_password = get_password_hash(update_data["password"])
            del update_data["password"]
            update_data["password_hash"] = hashed_password
        for field in update_data:
            setattr(db_obj, field, update_data[field])
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    @classmethod
    async def authenticate(
        cls,
        db: AsyncSession,
        *,
        email: str,
        password: str,
    ) -> Optional["User"]:
        """用户认证."""
        user = await cls.get_by_email(db, email=email)
        if not user:
            return None
        if not verify_password(password, user.password_hash):
            return None
        return user

    def has_permission(self, permission_name: str) -> bool:
        """检查用户是否有指定权限.
        
        Args:
            permission_name: 权限名称
            
        Returns:
            如果用户有指定权限返回True，否则返回False
        """
        if self.is_superuser:
            return True
            
        return any(
            permission.name == permission_name
            for role in self.roles
            for permission in role.permissions
        )
        
    def has_role(self, role_name: str) -> bool:
        """检查用户是否有指定角色.
        
        Args:
            role_name: 角色名称
            
        Returns:
            如果用户有指定角色返回True，否则返回False
        """
        if self.is_superuser:
            return True
            
        return any(role.name == role_name for role in self.roles)

    def __repr__(self) -> str:
        """返回用户字符串表示."""
        return f"<User {self.username}>" 