from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field

class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=8)

class UserResponse(UserBase):
    id: str
    is_active: bool
    is_verified: bool
    last_login: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    """Token响应模型."""
    
    access_token: str
    token_type: str

class RegisterRequest(BaseModel):
    """注册请求模型."""
    
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)

class LoginRequest(BaseModel):
    """登录请求模型."""
    
    username: str
    password: str
    remember_me: Optional[bool] = False

class PasswordResetRequest(BaseModel):
    """密码重置请求模型."""
    
    email: EmailStr

class PasswordResetConfirmRequest(BaseModel):
    """密码重置确认请求模型."""
    
    new_password: str = Field(..., min_length=8, max_length=100)
    confirm_password: str = Field(..., min_length=8, max_length=100)
    
    def validate_passwords_match(self):
        """验证两次密码是否匹配."""
        if self.new_password != self.confirm_password:
            raise ValueError("两次输入的密码不匹配") 