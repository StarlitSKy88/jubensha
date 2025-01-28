from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
import yaml
import logging

# 加载配置
with open("config/config.yaml", "r") as f:
    config = yaml.safe_load(f)

# 配置日志
logger = logging.getLogger(__name__)

# 创建异步引擎
engine = create_async_engine(
    config["database"]["url"],
    pool_size=config["database"]["pool_size"],
    max_overflow=config["database"]["max_overflow"],
    echo=config["database"]["echo"]
)

# 创建异步会话工厂
AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

async def get_session() -> AsyncSession:
    """获取数据库会话"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception as e:
            logger.error(f"数据库会话错误: {str(e)}")
            await session.rollback()
            raise
        finally:
            await session.close()

async def init_db():
    """初始化数据库"""
    from models import Base
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("数据库初始化完成") 