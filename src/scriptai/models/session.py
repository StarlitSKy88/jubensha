"""会话相关模型."""
from datetime import datetime
import uuid

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from .base import Base
from .user import User

class Session(Base):
    """会话模型."""
    
    __tablename__ = "sessions"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), 
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )
    token: Mapped[str] = mapped_column(String(36), unique=True, nullable=False)
    user_agent: Mapped[str] = mapped_column(String(200), nullable=True)
    ip_address: Mapped[str] = mapped_column(String(45), nullable=True)
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    # 关系
    user: Mapped[User] = relationship("User", lazy="joined")

    def __repr__(self) -> str:
        """返回会话字符串表示."""
        return f"<Session {self.id} (user: {self.user_id})>" 