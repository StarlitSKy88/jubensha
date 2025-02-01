"""用户相关的API端点."""
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from scriptai.core.security import get_current_active_superuser, get_current_active_user
from scriptai.db.session import get_db
from scriptai.models.user import User
from scriptai.schemas.user import UserCreate, UserInDB, UserUpdate

router = APIRouter()


@router.get("/me", response_model=UserInDB)
async def read_user_me(
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """获取当前用户信息."""
    return current_user


@router.put("/me", response_model=UserInDB)
async def update_user_me(
    *,
    db: AsyncSession = Depends(get_db),
    user_in: UserUpdate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """更新当前用户信息."""
    user = await User.update(db, db_obj=current_user, obj_in=user_in)
    return user


@router.get("", response_model=List[UserInDB])
async def read_users(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_superuser),
) -> Any:
    """获取用户列表."""
    users = await User.get_multi(db, skip=skip, limit=limit)
    return users


@router.post("", response_model=UserInDB)
async def create_user(
    *,
    db: AsyncSession = Depends(get_db),
    user_in: UserCreate,
    current_user: User = Depends(get_current_active_superuser),
) -> Any:
    """创建新用户."""
    user = await User.get_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="该邮箱已被注册",
        )
    user = await User.create(db, obj_in=user_in)
    return user


@router.get("/{user_id}", response_model=UserInDB)
async def read_user_by_id(
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """根据ID获取用户信息."""
    user = await User.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在",
        )
    if user.id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="权限不足",
        )
    return user


@router.put("/{user_id}", response_model=UserInDB)
async def update_user(
    *,
    db: AsyncSession = Depends(get_db),
    user_id: int,
    user_in: UserUpdate,
    current_user: User = Depends(get_current_active_superuser),
) -> Any:
    """更新用户信息."""
    user = await User.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在",
        )
    user = await User.update(db, db_obj=user, obj_in=user_in)
    return user


@router.delete("/{user_id}", response_model=UserInDB)
async def delete_user(
    *,
    db: AsyncSession = Depends(get_db),
    user_id: int,
    current_user: User = Depends(get_current_active_superuser),
) -> Any:
    """删除用户."""
    user = await User.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在",
        )
    user = await User.remove(db, id=user_id)
    return user 