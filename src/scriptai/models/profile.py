"""用户资料相关模型."""
from datetime import date, datetime
import uuid

from sqlalchemy import Date, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from .base import Base

class UserProfile(Base):
    """用户资料模型."""
    
    __tablename__ = "user_profiles"
    
    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False
    )
    avatar_url: Mapped[str] = mapped_column(String(255), nullable=True)
    nickname: Mapped[str] = mapped_column(String(50), nullable=True)
    bio: Mapped[str] = mapped_column(String(500), nullable=True)
    location: Mapped[str] = mapped_column(String(100), nullable=True)
    website: Mapped[str] = mapped_column(String(200), nullable=True)
    gender: Mapped[str] = mapped_column(String(10), nullable=True)
    birthday: Mapped[date] = mapped_column(Date, nullable=True)
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
    user = relationship("User", back_populates="profile")
    
    def __repr__(self) -> str:
        """返回用户资料字符串表示."""
        return f"<UserProfile {self.nickname or self.user_id}>"

class UserSettings(Base):
    """用户设置模型."""
    
    __tablename__ = "user_settings"
    
    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False
    )
    language: Mapped[str] = mapped_column(
        String(10),
        server_default="zh-CN",
        nullable=False
    )
    timezone: Mapped[str] = mapped_column(
        String(50),
        server_default="Asia/Shanghai",
        nullable=False
    )
    notification_email: Mapped[bool] = mapped_column(
        server_default="true",
        nullable=False
    )
    notification_web: Mapped[bool] = mapped_column(
        server_default="true",
        nullable=False
    )
    theme: Mapped[str] = mapped_column(
        String(20),
        server_default="light",
        nullable=False
    )
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
    user = relationship("User", back_populates="settings")
    
    def __repr__(self) -> str:
        """返回用户设置字符串表示."""
        return f"<UserSettings {self.user_id}>" 