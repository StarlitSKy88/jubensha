"""剧本模型."""
from typing import Any, Dict, List, Optional

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Mapped, mapped_column, relationship

from scriptai.db.base_class import Base


class Script(Base):
    """剧本模型."""

    title: Mapped[str] = mapped_column(String(255), index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    content: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    genre: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    status: Mapped[str] = mapped_column(
        String(20),
        default="draft",
        index=True,
    )
    owner_id: Mapped[int] = mapped_column(ForeignKey("user.id"), index=True)
    owner: Mapped["User"] = relationship("User", back_populates="scripts")

    @classmethod
    async def get_multi_by_owner(
        cls,
        db: AsyncSession,
        *,
        owner_id: int,
        skip: int = 0,
        limit: int = 100,
    ) -> List["Script"]:
        """获取用户的剧本列表."""
        result = await db.execute(
            cls.__table__.select()
            .where(cls.owner_id == owner_id)
            .offset(skip)
            .limit(limit),
        )
        return result.scalars().all()

    @classmethod
    async def create_with_owner(
        cls,
        db: AsyncSession,
        *,
        obj_in: Dict[str, Any],
        owner_id: int,
    ) -> "Script":
        """创建剧本."""
        db_obj = cls(**obj_in, owner_id=owner_id)
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    @classmethod
    async def get_by_title(
        cls,
        db: AsyncSession,
        *,
        title: str,
        owner_id: int,
    ) -> Optional["Script"]:
        """根据标题获取剧本."""
        result = await db.execute(
            cls.__table__.select().where(
                cls.title == title,
                cls.owner_id == owner_id,
            ),
        )
        return result.scalar_one_or_none()

    @classmethod
    async def update(
        cls,
        db: AsyncSession,
        *,
        db_obj: "Script",
        obj_in: Dict[str, Any],
    ) -> "Script":
        """更新剧本."""
        for field in obj_in:
            setattr(db_obj, field, obj_in[field])
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    def __repr__(self) -> str:
        """字符串表示."""
        return f"<Script {self.title}>" 