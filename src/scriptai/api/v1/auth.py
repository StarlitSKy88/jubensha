from typing import Optional

from fastapi import APIRouter, Depends, Header, Request, HTTPException, BackgroundTasks, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from ...schemas.auth import TokenResponse, UserCreate, UserResponse, RegisterRequest, PasswordResetRequest, PasswordResetConfirmRequest
from ...services.auth import AuthService
from ...models import User
from scriptai.db.session import get_db

router = APIRouter(prefix="/auth", tags=["认证"])

@router.post("/register", response_model=UserResponse)
async def register(
    request: RegisterRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """用户注册."""
    auth_service = AuthService(db)
    try:
        user, verification_token = await auth_service.create_user(
            username=request.username,
            email=request.email,
            password=request.password,
            background_tasks=background_tasks
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
        
    return {
        "access_token": verification_token,
        "token_type": "bearer"
    }

@router.post("/login", response_model=TokenResponse)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    """用户登录."""
    auth_service = AuthService(db)
    session = await auth_service.authenticate_user(
        username=form_data.username,
        password=form_data.password
    )
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误"
        )
        
    return {
        "access_token": session.token,
        "token_type": "bearer"
    }

@router.get("/verify-email/{token}")
async def verify_email(
    token: str,
    db: AsyncSession = Depends(get_db)
):
    """验证邮箱."""
    auth_service = AuthService(db)
    if await auth_service.verify_email(token):
        return {"message": "邮箱验证成功"}
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="验证失败"
        )

@router.post("/forgot-password")
async def forgot_password(
    request: PasswordResetRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """忘记密码."""
    auth_service = AuthService(db)
    reset_token = await auth_service.request_password_reset(
        email=request.email,
        background_tasks=background_tasks
    )
    
    if not reset_token:
        # 即使用户不存在也返回成功，避免泄露用户信息
        return {"message": "如果邮箱存在，重置链接将发送到您的邮箱"}
        
    return {"message": "重置链接已发送到您的邮箱"}

@router.post("/reset-password/{token}")
async def reset_password(
    token: str,
    request: PasswordResetConfirmRequest,
    db: AsyncSession = Depends(get_db)
):
    """重置密码."""
    auth_service = AuthService(db)
    if await auth_service.reset_password(token, request.new_password):
        return {"message": "密码重置成功"}
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="重置失败"
        )

@router.post("/logout")
async def logout(
    token: str = Depends(OAuth2PasswordRequestForm),
    db: AsyncSession = Depends(get_db)
):
    """用户登出."""
    auth_service = AuthService(db)
    if await auth_service.invalidate_session(token):
        return {"message": "登出成功"}
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="登出失败"
        )

@router.get("/session", response_model=UserResponse)
async def get_session(
    token: str = Depends(OAuth2PasswordBearer(tokenUrl="auth/login")),
    auth_service: AuthService = Depends()
):
    """获取当前会话信息."""
    user = await auth_service.validate_token(token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user 