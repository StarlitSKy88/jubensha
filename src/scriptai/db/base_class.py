"""数据库模型基类."""
from typing import Any

from sqlalchemy.ext.declarative import declared_attr
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy.sql import func


class Base(DeclarativeBase):
    """SQLAlchemy 声明性基类."""

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    # 通用时间戳
    created_at: Mapped[Any] = mapped_column(server_default=func.now())
    updated_at: Mapped[Any] = mapped_column(
        server_default=func.now(),
        onupdate=func.now(),
    )

    # 生成表名
    @declared_attr.directive
    def __tablename__(cls) -> str:
        """生成表名."""
        return cls.__name__.lower()

    def dict(self) -> dict[str, Any]:
        """将模型转换为字典."""
        return {
            column.name: getattr(self, column.name)
            for column in self.__table__.columns
        }

    def __repr__(self) -> str:
        """模型的字符串表示."""
        attrs = ", ".join(
            f"{column.name}={getattr(self, column.name)!r}"
            for column in self.__table__.columns
        )
        return f"{self.__class__.__name__}({attrs})" 