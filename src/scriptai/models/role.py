"""角色和权限相关模型."""
from datetime import datetime
import uuid
from typing import List

from sqlalchemy import DateTime, ForeignKey, String, Table, Column
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from .base import Base

# 角色-权限关联表
role_permissions = Table(
    "role_permissions",
    Base.metadata,
    Column("role_id", String(36), ForeignKey("roles.id", ondelete="CASCADE")),
    Column("permission_id", String(36), ForeignKey("permissions.id", ondelete="CASCADE")),
)

# 用户-角色关联表
user_roles = Table(
    "user_roles",
    Base.metadata,
    Column("user_id", String(36), ForeignKey("users.id", ondelete="CASCADE")),
    Column("role_id", String(36), ForeignKey("roles.id", ondelete="CASCADE")),
)

class Permission(Base):
    """权限模型."""
    
    __tablename__ = "permissions"
    
    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    description: Mapped[str] = mapped_column(String(200), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    
    def __repr__(self) -> str:
        """返回权限字符串表示."""
        return f"<Permission {self.name}>"

class Role(Base):
    """角色模型."""
    
    __tablename__ = "roles"
    
    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    description: Mapped[str] = mapped_column(String(200), nullable=True)
    is_system: Mapped[bool] = mapped_column(default=False, nullable=False)
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
    permissions: Mapped[List[Permission]] = relationship(
        "Permission",
        secondary=role_permissions,
        lazy="joined"
    )
    
    def __repr__(self) -> str:
        """返回角色字符串表示."""
        return f"<Role {self.name}>" 