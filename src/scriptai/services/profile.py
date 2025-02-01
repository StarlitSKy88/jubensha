"""用户资料服务."""
from datetime import date
from typing import Optional

from fastapi import UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from scriptai.models.user import User
from scriptai.models.profile import UserProfile, UserSettings
from scriptai.services.storage import storage_service

class ProfileService:
    """用户资料服务类."""
    
    def __init__(self, session: AsyncSession):
        """初始化用户资料服务.
        
        Args:
            session: 数据库会话
        """
        self.session = session
        
    async def get_profile(self, user_id: str) -> Optional[UserProfile]:
        """获取用户资料.
        
        Args:
            user_id: 用户ID
            
        Returns:
            用户资料对象，如果不存在返回None
        """
        query = select(UserProfile).where(UserProfile.user_id == user_id)
        result = await self.session.execute(query)
        return result.scalar_one_or_none()
        
    async def update_profile(
        self,
        user_id: str,
        nickname: Optional[str] = None,
        bio: Optional[str] = None,
        location: Optional[str] = None,
        website: Optional[str] = None,
        gender: Optional[str] = None,
        birthday: Optional[date] = None
    ) -> UserProfile:
        """更新用户资料.
        
        Args:
            user_id: 用户ID
            nickname: 昵称
            bio: 个人简介
            location: 位置
            website: 个人网站
            gender: 性别
            birthday: 生日
            
        Returns:
            更新后的用户资料对象
        """
        # 获取或创建用户资料
        profile = await self.get_profile(user_id)
        if not profile:
            profile = UserProfile(user_id=user_id)
            self.session.add(profile)
            
        # 更新字段
        if nickname is not None:
            profile.nickname = nickname
        if bio is not None:
            profile.bio = bio
        if location is not None:
            profile.location = location
        if website is not None:
            profile.website = website
        if gender is not None:
            profile.gender = gender
        if birthday is not None:
            profile.birthday = birthday
            
        await self.session.commit()
        await self.session.refresh(profile)
        
        return profile
        
    async def upload_avatar(
        self,
        user_id: str,
        file: UploadFile
    ) -> UserProfile:
        """上传头像.
        
        Args:
            user_id: 用户ID
            file: 上传的文件
            
        Returns:
            更新后的用户资料对象
            
        Raises:
            ValueError: 如果文件格式不支持
        """
        # 检查文件格式
        if not file.content_type.startswith('image/'):
            raise ValueError("不支持的文件格式")
            
        # 上传文件
        avatar_url = await storage_service.upload_file(
            file,
            f"avatars/{user_id}"
        )
        
        # 更新用户资料
        profile = await self.get_profile(user_id)
        if not profile:
            profile = UserProfile(user_id=user_id)
            self.session.add(profile)
            
        # 删除旧头像
        if profile.avatar_url:
            await storage_service.delete_file(profile.avatar_url)
            
        profile.avatar_url = avatar_url
        await self.session.commit()
        await self.session.refresh(profile)
        
        return profile
        
    async def get_settings(self, user_id: str) -> Optional[UserSettings]:
        """获取用户设置.
        
        Args:
            user_id: 用户ID
            
        Returns:
            用户设置对象，如果不存在返回None
        """
        query = select(UserSettings).where(UserSettings.user_id == user_id)
        result = await self.session.execute(query)
        return result.scalar_one_or_none()
        
    async def update_settings(
        self,
        user_id: str,
        language: Optional[str] = None,
        timezone: Optional[str] = None,
        notification_email: Optional[bool] = None,
        notification_web: Optional[bool] = None,
        theme: Optional[str] = None
    ) -> UserSettings:
        """更新用户设置.
        
        Args:
            user_id: 用户ID
            language: 语言
            timezone: 时区
            notification_email: 是否开启邮件通知
            notification_web: 是否开启网页通知
            theme: 主题
            
        Returns:
            更新后的用户设置对象
        """
        # 获取或创建用户设置
        settings = await self.get_settings(user_id)
        if not settings:
            settings = UserSettings(user_id=user_id)
            self.session.add(settings)
            
        # 更新字段
        if language is not None:
            settings.language = language
        if timezone is not None:
            settings.timezone = timezone
        if notification_email is not None:
            settings.notification_email = notification_email
        if notification_web is not None:
            settings.notification_web = notification_web
        if theme is not None:
            settings.theme = theme
            
        await self.session.commit()
        await self.session.refresh(settings)
        
        return settings 