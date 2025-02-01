"""剧本相关的Pydantic模型."""
from typing import Optional

from pydantic import BaseModel, Field


class ScriptBase(BaseModel):
    """剧本基础模型."""

    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    content: Optional[str] = None
    genre: Optional[str] = Field(None, max_length=50)
    status: Optional[str] = Field("draft", max_length=20)


class ScriptCreate(ScriptBase):
    """剧本创建模型."""

    title: str = Field(..., min_length=1, max_length=255)


class ScriptUpdate(ScriptBase):
    """剧本更新模型."""

    pass


class ScriptInDBBase(ScriptBase):
    """数据库中的剧本基础模型."""

    id: int
    owner_id: int

    class Config:
        """配置类."""

        from_attributes = True


class ScriptInDB(ScriptInDBBase):
    """数据库中的剧本模型."""

    pass 