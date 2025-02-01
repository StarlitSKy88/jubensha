from datetime import datetime, timedelta
from typing import Optional, Tuple
import uuid

from fastapi import Depends, HTTPException, status, BackgroundTasks
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..database import get_session
from ..models import Session, User
from ..config import settings
from .websocket import ws_manager
from scriptai.core.security import get_password_hash, verify_password
from scriptai.services.email import email_service

# 密码加密上下文
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 配置
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

class AuthService:
    """认证服务类."""
    
    def __init__(self, session: AsyncSession = Depends(get_session)):
        """初始化认证服务.
        
        Args:
            session: 数据库会话
        """
        self.session = session

    async def authenticate_user(
        self, 
        username: str, 
        password: str,
        user_agent: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> Optional[Session]:
        """验证用户并创建会话.
        
        Args:
            username: 用户名
            password: 密码
            user_agent: 用户代理
            ip_address: IP地址
            
        Returns:
            如果认证成功返回会话对象，否则返回None
        """
        # 查找用户
        query = select(User).where(User.username == username)
        result = await self.session.execute(query)
        user = result.scalar_one_or_none()
        
        if not user or not verify_password(password, user.password_hash):
            return None
            
        if not user.is_active:
            return None
            
        # 更新最后登录时间
        user.last_login = datetime.utcnow()
        
        # 创建新会话
        session = Session(
            user_id=user.id,
            token=str(uuid.uuid4()),
            user_agent=user_agent,
            ip_address=ip_address,
            expires_at=datetime.utcnow() + timedelta(days=7)
        )
        
        self.session.add(session)
        await self.session.commit()
        
        return session
        
    async def get_session(self, token: str) -> Optional[Session]:
        """通过令牌获取会话.
        
        Args:
            token: 会话令牌
            
        Returns:
            如果找到有效会话返回会话对象，否则返回None
        """
        query = select(Session).where(
            Session.token == token,
            Session.expires_at > datetime.utcnow()
        )
        result = await self.session.execute(query)
        return result.scalar_one_or_none()
        
    async def create_user(
        self,
        username: str,
        email: str,
        password: str,
        background_tasks: Optional[BackgroundTasks] = None
    ) -> Tuple[User, str]:
        """创建新用户.
        
        Args:
            username: 用户名
            email: 电子邮件
            password: 密码
            background_tasks: 后台任务
            
        Returns:
            (用户对象, 验证令牌)元组
            
        Raises:
            ValueError: 如果用户名或邮箱已存在
        """
        # 检查用户名是否已存在
        query = select(User).where(User.username == username)
        result = await self.session.execute(query)
        if result.scalar_one_or_none():
            raise ValueError("用户名已存在")
            
        # 检查邮箱是否已存在
        query = select(User).where(User.email == email)
        result = await self.session.execute(query)
        if result.scalar_one_or_none():
            raise ValueError("邮箱已存在")
            
        # 创建新用户
        user = User(
            username=username,
            email=email,
            password_hash=get_password_hash(password),
            is_active=False  # 需要邮箱验证
        )
        
        self.session.add(user)
        await self.session.commit()
        await self.session.refresh(user)
        
        # 生成验证令牌
        verification_token = str(uuid.uuid4())
        
        # 发送验证邮件
        if background_tasks:
            verification_url = f"http://localhost:8000/api/v1/auth/verify-email/{verification_token}"
            await email_service.send_verification_email(
                to_email=email,
                verification_url=verification_url,
                background_tasks=background_tasks
            )
        
        return user, verification_token
        
    async def verify_email(self, token: str) -> bool:
        """验证邮箱.
        
        Args:
            token: 验证令牌
            
        Returns:
            如果验证成功返回True，否则返回False
        """
        # TODO: 实现邮箱验证逻辑
        return True
        
    async def request_password_reset(
        self,
        email: str,
        background_tasks: Optional[BackgroundTasks] = None
    ) -> Optional[str]:
        """请求密码重置.
        
        Args:
            email: 用户邮箱
            background_tasks: 后台任务
            
        Returns:
            如果用户存在返回重置令牌，否则返回None
        """
        # 查找用户
        query = select(User).where(User.email == email)
        result = await self.session.execute(query)
        user = result.scalar_one_or_none()
        
        if not user:
            return None
            
        # 生成重置令牌
        reset_token = str(uuid.uuid4())
        
        # 发送重置邮件
        if background_tasks:
            reset_url = f"http://localhost:8000/api/v1/auth/reset-password/{reset_token}"
            await email_service.send_password_reset_email(
                to_email=email,
                reset_url=reset_url,
                background_tasks=background_tasks
            )
        
        return reset_token
        
    async def reset_password(
        self,
        token: str,
        new_password: str
    ) -> bool:
        """重置密码.
        
        Args:
            token: 重置令牌
            new_password: 新密码
            
        Returns:
            如果重置成功返回True，否则返回False
        """
        # TODO: 实现密码重置逻辑
        return True
        
    async def invalidate_session(self, token: str) -> bool:
        """使会话失效.
        
        Args:
            token: 会话令牌
            
        Returns:
            如果成功使会话失效返回True，否则返回False
        """
        query = select(Session).where(Session.token == token)
        result = await self.session.execute(query)
        session = result.scalar_one_or_none()
        
        if not session:
            return False
            
        await self.session.delete(session)
        await self.session.commit()
        
        return True

    async def validate_token(self, token: str) -> Optional[User]:
        """验证token并返回用户."""
        session = await self.session.query(Session).filter(
            Session.token == token,
            Session.expires_at > datetime.utcnow()
        ).first()

        if not session:
            return None

        user = await self.session.get(User, session.user_id)
        if not user or not user.is_active:
            return None

        return user

    async def invalidate_user_sessions(self, user_id: str) -> None:
        """使指定用户的所有会话失效."""
        await self.session.query(Session).filter(
            Session.user_id == user_id,
            Session.expires_at > datetime.utcnow()
        ).delete()
        await self.session.commit()

    async def logout(self, token: str) -> None:
        """登出用户."""
        session = await self.session.query(Session).filter(
            Session.token == token
        ).first()
        
        if session:
            await self.session.delete(session)
            await self.session.commit()

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """验证密码."""
        return pwd_context.verify(plain_password, hashed_password)

    @staticmethod
    def get_password_hash(password: str) -> str:
        """生成密码哈希."""
        return pwd_context.hash(password)

    @staticmethod
    def create_token() -> str:
        """创建新的会话token."""
        return str(uuid.uuid4()) 