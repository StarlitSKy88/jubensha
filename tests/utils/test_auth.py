import pytest
from datetime import datetime, timedelta
import jwt
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from src.utils.auth import AuthManager, Role, Permission, AuthorizationError

@pytest.fixture
def auth_manager():
    """创建测试用的认证管理器"""
    return AuthManager(
        secret_key="test-secret-key",
        token_expire_minutes=60
    )

@pytest.fixture
def test_user():
    """创建测试用户数据"""
    return {
        "user_id": "test_user_001",
        "role": Role.USER,
        "extra_claims": {
            "email": "test@example.com",
            "name": "Test User"
        }
    }

def test_create_token(auth_manager, test_user):
    """测试创建token功能"""
    token = auth_manager.create_token(
        test_user["user_id"],
        test_user["role"],
        test_user["extra_claims"]
    )
    assert isinstance(token, str)
    
    # 验证token内容
    claims = jwt.decode(token, auth_manager.secret_key, algorithms=["HS256"])
    assert claims["sub"] == test_user["user_id"]
    assert claims["role"] == test_user["role"]
    assert claims["email"] == test_user["extra_claims"]["email"]
    assert "exp" in claims

def test_verify_token(auth_manager, test_user):
    """测试验证token功能"""
    token = auth_manager.create_token(
        test_user["user_id"],
        test_user["role"]
    )
    
    # 创建认证凭证
    credentials = HTTPAuthorizationCredentials(
        scheme="Bearer",
        credentials=token
    )
    
    # 验证token
    claims = auth_manager.verify_token(credentials)
    assert claims["sub"] == test_user["user_id"]
    assert claims["role"] == test_user["role"]

def test_expired_token(auth_manager, test_user):
    """测试过期token"""
    # 创建已过期的token
    expire = datetime.utcnow() - timedelta(minutes=1)
    claims = {
        "sub": test_user["user_id"],
        "role": test_user["role"],
        "exp": expire
    }
    token = jwt.encode(claims, auth_manager.secret_key, algorithm="HS256")
    
    # 验证过期token
    credentials = HTTPAuthorizationCredentials(
        scheme="Bearer",
        credentials=token
    )
    
    with pytest.raises(AuthorizationError) as exc_info:
        auth_manager.verify_token(credentials)
    assert "expired" in str(exc_info.value)

def test_invalid_token(auth_manager):
    """测试无效token"""
    # 使用错误的密钥创建token
    token = jwt.encode(
        {"sub": "test"},
        "wrong-secret-key",
        algorithm="HS256"
    )
    
    credentials = HTTPAuthorizationCredentials(
        scheme="Bearer",
        credentials=token
    )
    
    with pytest.raises(AuthorizationError) as exc_info:
        auth_manager.verify_token(credentials)
    assert "Invalid token" in str(exc_info.value)

def test_check_permission(auth_manager):
    """测试权限检查功能"""
    # 测试管理员权限
    admin_claims = {"role": Role.ADMIN}
    assert auth_manager.check_permission(admin_claims, Permission.MANAGE)
    assert auth_manager.check_permission(admin_claims, Permission.READ)
    assert auth_manager.check_permission(admin_claims, Permission.WRITE)
    assert auth_manager.check_permission(admin_claims, Permission.DELETE)
    
    # 测试普通用户权限
    user_claims = {"role": Role.USER}
    assert auth_manager.check_permission(user_claims, Permission.READ)
    assert auth_manager.check_permission(user_claims, Permission.WRITE)
    assert not auth_manager.check_permission(user_claims, Permission.DELETE)
    assert not auth_manager.check_permission(user_claims, Permission.MANAGE)
    
    # 测试访客权限
    guest_claims = {"role": Role.GUEST}
    assert auth_manager.check_permission(guest_claims, Permission.READ)
    assert not auth_manager.check_permission(guest_claims, Permission.WRITE)
    assert not auth_manager.check_permission(guest_claims, Permission.DELETE)
    assert not auth_manager.check_permission(guest_claims, Permission.MANAGE)

@pytest.mark.asyncio
async def test_require_permission_decorator(auth_manager, test_user):
    """测试权限要求装饰器"""
    # 创建测试函数
    @auth_manager.require_permission(Permission.READ)
    async def test_func(credentials):
        return True
    
    # 创建有效token
    token = auth_manager.create_token(test_user["user_id"], test_user["role"])
    credentials = HTTPAuthorizationCredentials(
        scheme="Bearer",
        credentials=token
    )
    
    # 测试有权限的情况
    result = await test_func(credentials=credentials)
    assert result == True
    
    # 测试无权限的情况
    @auth_manager.require_permission(Permission.MANAGE)
    async def test_func2(credentials):
        return True
    
    with pytest.raises(AuthorizationError) as exc_info:
        await test_func2(credentials=credentials)
    assert "Permission denied" in str(exc_info.value)

def test_role_permissions(auth_manager):
    """测试角色权限映射"""
    assert set(auth_manager.role_permissions[Role.ADMIN]) == {
        Permission.READ,
        Permission.WRITE,
        Permission.DELETE,
        Permission.MANAGE
    }
    
    assert set(auth_manager.role_permissions[Role.USER]) == {
        Permission.READ,
        Permission.WRITE
    }
    
    assert set(auth_manager.role_permissions[Role.GUEST]) == {
        Permission.READ
    } 