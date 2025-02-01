"""用户资料相关的数据模型."""
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, HttpUrl

class ProfileBase(BaseModel):
    """用户资料基础模型."""
    
    nickname: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    website: Optional[HttpUrl] = None
    gender: Optional[str] = None
    birthday: Optional[date] = None

class ProfileUpdate(ProfileBase):
    """用户资料更新模型."""
    pass

class ProfileResponse(ProfileBase):
    """用户资料响应模型."""
    
    id: str
    user_id: str
    avatar_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        """配置."""
        
        from_attributes = True

class SettingsBase(BaseModel):
    """用户设置基础模型."""
    
    language: Optional[str] = None
    timezone: Optional[str] = None
    notification_email: Optional[bool] = None
    notification_web: Optional[bool] = None
    theme: Optional[str] = None

class SettingsUpdate(SettingsBase):
    """用户设置更新模型."""
    pass

class SettingsResponse(SettingsBase):
    """用户设置响应模型."""
    
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        """配置."""
        
        from_attributes = True 