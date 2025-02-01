"""用户资料API."""
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from scriptai.core.security import get_current_user
from scriptai.db.session import get_db
from scriptai.models.user import User
from scriptai.schemas.profile import (
    ProfileUpdate,
    ProfileResponse,
    SettingsUpdate,
    SettingsResponse
)
from scriptai.services.profile import ProfileService

router = APIRouter(
    prefix="/profiles",
    tags=["用户资料"],
    responses={
        401: {"description": "未认证"},
        403: {"description": "权限不足"},
        404: {"description": "资源不存在"},
        500: {"description": "服务器内部错误"}
    }
)

@router.get(
    "/me/profile",
    response_model=ProfileResponse,
    summary="获取个人资料",
    description="获取当前登录用户的个人资料信息，如果资料不存在会创建默认资料"
)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """获取当前用户资料.
    
    Returns:
        用户资料对象
    
    Raises:
        401: 未认证
        500: 服务器内部错误
    """
    profile_service = ProfileService(db)
    profile = await profile_service.get_profile(current_user.id)
    
    if not profile:
        # 如果资料不存在，创建默认资料
        profile = await profile_service.update_profile(current_user.id)
        
    return profile

@router.put(
    "/me/profile",
    response_model=ProfileResponse,
    summary="更新个人资料",
    description="更新当前登录用户的个人资料信息"
)
async def update_my_profile(
    profile_update: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """更新当前用户资料.
    
    Args:
        profile_update: 资料更新数据
        
    Returns:
        更新后的用户资料对象
        
    Raises:
        401: 未认证
        500: 服务器内部错误
    """
    profile_service = ProfileService(db)
    profile = await profile_service.update_profile(
        user_id=current_user.id,
        **profile_update.model_dump(exclude_unset=True)
    )
    return profile

@router.post(
    "/me/avatar",
    response_model=ProfileResponse,
    summary="上传头像",
    description="上传并更新当前登录用户的头像"
)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """上传头像.
    
    Args:
        file: 头像文件，支持的格式：jpg, jpeg, png, gif
        
    Returns:
        更新后的用户资料对象
        
    Raises:
        400: 不支持的文件格式
        401: 未认证
        500: 服务器内部错误
    """
    profile_service = ProfileService(db)
    try:
        profile = await profile_service.upload_avatar(
            user_id=current_user.id,
            file=file
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    return profile

@router.get(
    "/me/settings",
    response_model=SettingsResponse,
    summary="获取个人设置",
    description="获取当前登录用户的个人设置，如果设置不存在会创建默认设置"
)
async def get_my_settings(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """获取当前用户设置.
    
    Returns:
        用户设置对象
        
    Raises:
        401: 未认证
        500: 服务器内部错误
    """
    profile_service = ProfileService(db)
    settings = await profile_service.get_settings(current_user.id)
    
    if not settings:
        # 如果设置不存在，创建默认设置
        settings = await profile_service.update_settings(current_user.id)
        
    return settings

@router.put(
    "/me/settings",
    response_model=SettingsResponse,
    summary="更新个人设置",
    description="更新当前登录用户的个人设置"
)
async def update_my_settings(
    settings_update: SettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """更新当前用户设置.
    
    Args:
        settings_update: 设置更新数据
        
    Returns:
        更新后的用户设置对象
        
    Raises:
        401: 未认证
        500: 服务器内部错误
    """
    profile_service = ProfileService(db)
    settings = await profile_service.update_settings(
        user_id=current_user.id,
        **settings_update.model_dump(exclude_unset=True)
    )
    return settings

@router.get(
    "/users/{user_id}/profile",
    response_model=ProfileResponse,
    summary="获取用户资料",
    description="获取指定用户的公开资料信息"
)
async def get_user_profile(
    user_id: str,
    db: AsyncSession = Depends(get_db)
):
    """获取指定用户资料.
    
    Args:
        user_id: 用户ID
        
    Returns:
        用户资料对象
        
    Raises:
        404: 用户资料不存在
        500: 服务器内部错误
    """
    profile_service = ProfileService(db)
    profile = await profile_service.get_profile(user_id)
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户资料不存在"
        )
        
    return profile 