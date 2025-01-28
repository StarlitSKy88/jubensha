from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
import yaml

from database import get_session
from models import User

# 加载配置
with open("config/config.yaml", "r") as f:
    config = yaml.safe_load(f)

# 密码上下文
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """验证密码"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """获取密码哈希"""
    return pwd_context.hash(password)

def create_access_token(data: dict) -> str:
    """创建访问令牌"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(
        minutes=config["jwt"]["access_token_expire_minutes"]
    )
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode,
        config["jwt"]["secret_key"],
        algorithm=config["jwt"]["algorithm"]
    )
    return encoded_jwt

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_session)
) -> User:
    """获取当前用户"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="无效的认证凭据",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token,
            config["jwt"]["secret_key"],
            algorithms=[config["jwt"]["algorithm"]]
        )
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await get_user_by_username(db, username)
    if user is None:
        raise credentials_exception
    return user

async def authenticate_user(
    db: AsyncSession,
    username: str,
    password: str
) -> Optional[User]:
    """认证用户"""
    user = await get_user_by_username(db, username)
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user

async def get_user_by_username(
    db: AsyncSession,
    username: str
) -> Optional[User]:
    """通过用户名获取用户"""
    result = await db.execute(
        User.__table__.select().where(User.username == username)
    )
    return result.scalar_one_or_none()

async def create_new_user(
    db: AsyncSession,
    user_data: dict
) -> User:
    """创建新用户"""
    db_user = User(
        username=user_data["username"],
        email=user_data["email"],
        password_hash=get_password_hash(user_data["password"])
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user 