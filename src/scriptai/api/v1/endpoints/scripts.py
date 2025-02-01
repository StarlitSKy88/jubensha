"""剧本相关的API端点."""
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from scriptai.core.security import get_current_active_user
from scriptai.db.session import get_db
from scriptai.models.script import Script
from scriptai.models.user import User
from scriptai.schemas.script import ScriptCreate, ScriptInDB, ScriptUpdate

router = APIRouter()


@router.get("", response_model=List[ScriptInDB])
async def read_scripts(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """获取剧本列表."""
    if current_user.is_superuser:
        scripts = await Script.get_multi(db, skip=skip, limit=limit)
    else:
        scripts = await Script.get_multi_by_owner(
            db=db,
            owner_id=current_user.id,
            skip=skip,
            limit=limit,
        )
    return scripts


@router.post("", response_model=ScriptInDB)
async def create_script(
    *,
    db: AsyncSession = Depends(get_db),
    script_in: ScriptCreate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """创建新剧本."""
    script = await Script.create_with_owner(
        db=db,
        obj_in=script_in,
        owner_id=current_user.id,
    )
    return script


@router.get("/{script_id}", response_model=ScriptInDB)
async def read_script(
    *,
    db: AsyncSession = Depends(get_db),
    script_id: int,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """获取剧本详情."""
    script = await Script.get(db=db, id=script_id)
    if not script:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="剧本不存在",
        )
    if not current_user.is_superuser and (script.owner_id != current_user.id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="权限不足",
        )
    return script


@router.put("/{script_id}", response_model=ScriptInDB)
async def update_script(
    *,
    db: AsyncSession = Depends(get_db),
    script_id: int,
    script_in: ScriptUpdate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """更新剧本."""
    script = await Script.get(db=db, id=script_id)
    if not script:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="剧本不存在",
        )
    if not current_user.is_superuser and (script.owner_id != current_user.id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="权限不足",
        )
    script = await Script.update(db=db, db_obj=script, obj_in=script_in)
    return script


@router.delete("/{script_id}", response_model=ScriptInDB)
async def delete_script(
    *,
    db: AsyncSession = Depends(get_db),
    script_id: int,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """删除剧本."""
    script = await Script.get(db=db, id=script_id)
    if not script:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="剧本不存在",
        )
    if not current_user.is_superuser and (script.owner_id != current_user.id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="权限不足",
        )
    script = await Script.remove(db=db, id=script_id)
    return script


@router.post("/{script_id}/generate", response_model=ScriptInDB)
async def generate_script_content(
    *,
    db: AsyncSession = Depends(get_db),
    script_id: int,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """生成剧本内容."""
    script = await Script.get(db=db, id=script_id)
    if not script:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="剧本不存在",
        )
    if not current_user.is_superuser and (script.owner_id != current_user.id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="权限不足",
        )
    # TODO: 实现AI生成剧本内容的逻辑
    return script


@router.post("/{script_id}/optimize", response_model=ScriptInDB)
async def optimize_script_content(
    *,
    db: AsyncSession = Depends(get_db),
    script_id: int,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """优化剧本内容."""
    script = await Script.get(db=db, id=script_id)
    if not script:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="剧本不存在",
        )
    if not current_user.is_superuser and (script.owner_id != current_user.id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="权限不足",
        )
    # TODO: 实现AI优化剧本内容的逻辑
    return script 