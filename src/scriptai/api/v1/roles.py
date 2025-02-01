"""角色管理API."""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from scriptai.core.security import require_permissions
from scriptai.db.session import get_db
from scriptai.models.role import Role, Permission
from scriptai.models.user import User
from scriptai.schemas.role import (
    RoleCreate,
    RoleUpdate,
    RoleResponse,
    PermissionResponse
)

router = APIRouter()

@router.get("/roles", response_model=List[RoleResponse])
@require_permissions("role:read")
async def list_roles(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends()
):
    """获取角色列表."""
    query = select(Role)
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/roles/{role_id}", response_model=RoleResponse)
@require_permissions("role:read")
async def get_role(
    role_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends()
):
    """获取角色详情."""
    query = select(Role).where(Role.id == role_id)
    result = await db.execute(query)
    role = result.scalar_one_or_none()
    
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="角色不存在"
        )
        
    return role

@router.post("/roles", response_model=RoleResponse)
@require_permissions("role:write")
async def create_role(
    role_in: RoleCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends()
):
    """创建角色."""
    # 检查角色名是否已存在
    query = select(Role).where(Role.name == role_in.name)
    result = await db.execute(query)
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="角色名已存在"
        )
        
    # 检查权限是否存在
    if role_in.permission_ids:
        query = select(Permission).where(
            Permission.id.in_(role_in.permission_ids)
        )
        result = await db.execute(query)
        permissions = result.scalars().all()
        
        if len(permissions) != len(role_in.permission_ids):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="部分权限不存在"
            )
            
        role = Role(
            name=role_in.name,
            description=role_in.description,
            permissions=permissions
        )
    else:
        role = Role(
            name=role_in.name,
            description=role_in.description
        )
        
    db.add(role)
    await db.commit()
    await db.refresh(role)
    
    return role

@router.put("/roles/{role_id}", response_model=RoleResponse)
@require_permissions("role:write")
async def update_role(
    role_id: str,
    role_in: RoleUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends()
):
    """更新角色."""
    # 获取角色
    query = select(Role).where(Role.id == role_id)
    result = await db.execute(query)
    role = result.scalar_one_or_none()
    
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="角色不存在"
        )
        
    if role.is_system:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="系统角色不能修改"
        )
        
    # 检查角色名是否已存在
    if role_in.name and role_in.name != role.name:
        query = select(Role).where(Role.name == role_in.name)
        result = await db.execute(query)
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="角色名已存在"
            )
            
    # 更新权限
    if role_in.permission_ids is not None:
        query = select(Permission).where(
            Permission.id.in_(role_in.permission_ids)
        )
        result = await db.execute(query)
        permissions = result.scalars().all()
        
        if len(permissions) != len(role_in.permission_ids):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="部分权限不存在"
            )
            
        role.permissions = permissions
        
    # 更新其他字段
    if role_in.name:
        role.name = role_in.name
    if role_in.description:
        role.description = role_in.description
        
    await db.commit()
    await db.refresh(role)
    
    return role

@router.delete("/roles/{role_id}")
@require_permissions("role:write")
async def delete_role(
    role_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends()
):
    """删除角色."""
    # 获取角色
    query = select(Role).where(Role.id == role_id)
    result = await db.execute(query)
    role = result.scalar_one_or_none()
    
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="角色不存在"
        )
        
    if role.is_system:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="系统角色不能删除"
        )
        
    await db.delete(role)
    await db.commit()
    
    return {"message": "角色已删除"}

@router.get("/permissions", response_model=List[PermissionResponse])
@require_permissions("permission:read")
async def list_permissions(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends()
):
    """获取权限列表."""
    query = select(Permission)
    result = await db.execute(query)
    return result.scalars().all() 