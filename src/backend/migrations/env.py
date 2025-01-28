import asyncio
from logging.config import fileConfig
import os
import yaml

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

# 加载项目配置
with open("config/config.yaml", "r") as f:
    config = yaml.safe_load(f)

# 导入模型
from models import Base

# 获取alembic配置
config = context.config

# 解析数据库URL
sqlalchemy_url = config["database"]["url"]

# 设置SQLAlchemy URL
config.set_main_option("sqlalchemy.url", sqlalchemy_url)

# 解释metadata以便自动生成迁移
target_metadata = Base.metadata

def run_migrations_offline() -> None:
    """在"离线"模式下运行迁移"""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def do_run_migrations(connection: Connection) -> None:
    """运行迁移"""
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True
    )

    with context.begin_transaction():
        context.run_migrations()

async def run_migrations_online() -> None:
    """在"在线"模式下运行迁移"""
    configuration = config.get_section(config.config_ini_section)
    
    # 创建异步引擎
    connectable = async_engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()

if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online()) 