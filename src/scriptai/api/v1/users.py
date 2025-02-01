"""用户管理API."""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from scriptai.core.security import require_permissions
from scriptai.db.session import get_db
from scriptai.models.role import Role
from scriptai.models.user import User
from scriptai.schemas.user import (
    UserCreate,
    UserUpdate,
    UserResponse,
    UserRoleUpdate
)

router = APIRouter()

@router.get("/users", response_model=List[UserResponse])
@require_permissions("user:read")
async def list_users(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends()
):
    """获取用户列表."""
    query = select(User)
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/users/{user_id}", response_model=UserResponse)
@require_permissions("user:read")
async def get_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends()
):
    """获取用户详情."""
    query = select(User).where(User.id == user_id)
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
        
    return user

@router.post("/users", response_model=UserResponse)
@require_permissions("user:write")
async def create_user(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends()
):
    """创建用户."""
    # 检查用户名是否已存在
    query = select(User).where(User.username == user_in.username)
    result = await db.execute(query)
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="用户名已存在"
        )
        
    # 检查邮箱是否已存在
    query = select(User).where(User.email == user_in.email)
    result = await db.execute(query)
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="邮箱已存在"
        )
        
    # 检查角色是否存在
    if user_in.role_ids:
        query = select(Role).where(Role.id.in_(user_in.role_ids))
        result = await db.execute(query)
        roles = result.scalars().all()
        
        if len(roles) != len(user_in.role_ids):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="部分角色不存在"
            )
            
        user = await User.create(db, obj_in=user_in.dict(exclude={"role_ids"}))
        user.roles = roles
    else:
        user = await User.create(db, obj_in=user_in.dict(exclude={"role_ids"}))
        
    await db.commit()
    await db.refresh(user)
    
    return user

@router.put("/users/{user_id}", response_model=UserResponse)
@require_permissions("user:write")
async def update_user(
    user_id: str,
    user_in: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends()
):
    """更新用户."""
    # 获取用户
    query = select(User).where(User.id == user_id)
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
        
    # 检查用户名是否已存在
    if user_in.username and user_in.username != user.username:
        query = select(User).where(User.username == user_in.username)
        result = await db.execute(query)
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="用户名已存在"
            )
            
    # 检查邮箱是否已存在
    if user_in.email and user_in.email != user.email:
        query = select(User).where(User.email == user_in.email)
        result = await db.execute(query)
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="邮箱已存在"
            )
            
    # 更新用户
    user = await User.update(
        db,
        db_obj=user,
        obj_in=user_in.dict(exclude_unset=True)
    )
    
    return user

@router.put("/users/{user_id}/roles", response_model=UserResponse)
@require_permissions("user:write")
async def update_user_roles(
    user_id: str,
    role_update: UserRoleUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends()
):
    """更新用户角色."""
    # 获取用户
    query = select(User).where(User.id == user_id)
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
        
    # 检查角色是否存在
    query = select(Role).where(Role.id.in_(role_update.role_ids))
    result = await db.execute(query)
    roles = result.scalars().all()
    
    if len(roles) != len(role_update.role_ids):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="部分角色不存在"
        )
        
    # 更新角色
    user.roles = roles
    await db.commit()
    await db.refresh(user)
    
    return user

@router.delete("/users/{user_id}")
@require_permissions("user:write")
async def delete_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends()
):
    """删除用户."""
    # 获取用户
    query = select(User).where(User.id == user_id)
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
        
    if user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="超级管理员不能删除"
        )
        
    await db.delete(user)
    await db.commit()
    
    return {"message": "用户已删除"} 