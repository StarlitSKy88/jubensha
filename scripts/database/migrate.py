#!/usr/bin/env python3
"""数据迁移工具."""
import argparse
import asyncio
import json
import logging
import os
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

import aiofiles
import asyncpg
from dotenv import load_dotenv
from pymilvus import Collection, connections
from tqdm import tqdm

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# 加载环境变量
load_dotenv()


class MigrationTool:
    """数据迁移工具类."""

    def __init__(self) -> None:
        """初始化迁移工具."""
        self.pg_pool: Optional[asyncpg.Pool] = None
        self.milvus_collection: Optional[Collection] = None
        self.backup_dir = Path(os.getenv("BACKUP_DIR", "./data/backups"))
        self.backup_dir.mkdir(parents=True, exist_ok=True)

    async def connect(self) -> None:
        """连接数据库和向量存储."""
        # 连接PostgreSQL
        self.pg_pool = await asyncpg.create_pool(
            os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/scriptai")
        )

        # 连接Milvus
        connections.connect(
            host=os.getenv("MILVUS_HOST", "localhost"),
            port=int(os.getenv("MILVUS_PORT", "19530")),
        )
        self.milvus_collection = Collection("documents")
        await self.milvus_collection.load()

    async def close(self) -> None:
        """关闭连接."""
        if self.pg_pool:
            await self.pg_pool.close()
        if self.milvus_collection:
            await self.milvus_collection.release()
            connections.disconnect()

    async def export_data(self, output_dir: Optional[str] = None) -> None:
        """导出数据.

        Args:
            output_dir: 输出目录
        """
        if not output_dir:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_dir = self.backup_dir / f"export_{timestamp}"
        else:
            output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)

        # 导出用户数据
        async with self.pg_pool.acquire() as conn:
            users = await conn.fetch("SELECT * FROM users")
            async with aiofiles.open(output_dir / "users.json", "w") as f:
                await f.write(json.dumps([dict(user) for user in users], indent=2))

        # 导出文档版本数据
        async with self.pg_pool.acquire() as conn:
            versions = await conn.fetch("SELECT * FROM document_versions")
            async with aiofiles.open(output_dir / "document_versions.json", "w") as f:
                await f.write(json.dumps([dict(version) for version in versions], indent=2))

        # 导出文档变更记录
        async with self.pg_pool.acquire() as conn:
            changes = await conn.fetch("SELECT * FROM document_changes")
            async with aiofiles.open(output_dir / "document_changes.json", "w") as f:
                await f.write(json.dumps([dict(change) for change in changes], indent=2))

        # 导出备份记录
        async with self.pg_pool.acquire() as conn:
            backups = await conn.fetch("SELECT * FROM backup_records")
            async with aiofiles.open(output_dir / "backup_records.json", "w") as f:
                await f.write(json.dumps([dict(backup) for backup in backups], indent=2))

        # 导出向量存储数据
        expr = ""
        limit = 1000
        offset = 0
        documents = []

        while True:
            results = self.milvus_collection.query(
                expr=expr,
                output_fields=["content", "metadata"],
                offset=offset,
                limit=limit,
            )
            if not results:
                break
            documents.extend(results)
            offset += limit

        async with aiofiles.open(output_dir / "documents.json", "w") as f:
            await f.write(json.dumps(documents, indent=2))

        logger.info(f"数据已导出到: {output_dir}")

    async def import_data(self, input_dir: str) -> None:
        """导入数据.

        Args:
            input_dir: 输入目录
        """
        input_dir = Path(input_dir)
        if not input_dir.exists():
            raise ValueError(f"目录不存在: {input_dir}")

        # 导入用户数据
        users_file = input_dir / "users.json"
        if users_file.exists():
            async with aiofiles.open(users_file) as f:
                content = await f.read()
                users = json.loads(content)
                async with self.pg_pool.acquire() as conn:
                    for user in tqdm(users, desc="导入用户"):
                        await conn.execute(
                            """
                            INSERT INTO users (id, email, username, full_name,
                                            hashed_password, is_active, is_superuser, role)
                            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                            ON CONFLICT (id) DO UPDATE
                            SET email = EXCLUDED.email,
                                username = EXCLUDED.username,
                                full_name = EXCLUDED.full_name,
                                hashed_password = EXCLUDED.hashed_password,
                                is_active = EXCLUDED.is_active,
                                is_superuser = EXCLUDED.is_superuser,
                                role = EXCLUDED.role
                            """,
                            user["id"],
                            user["email"],
                            user["username"],
                            user["full_name"],
                            user["hashed_password"],
                            user["is_active"],
                            user["is_superuser"],
                            user["role"],
                        )

        # 导入文档版本数据
        versions_file = input_dir / "document_versions.json"
        if versions_file.exists():
            async with aiofiles.open(versions_file) as f:
                content = await f.read()
                versions = json.loads(content)
                async with self.pg_pool.acquire() as conn:
                    for version in tqdm(versions, desc="导入文档版本"):
                        await conn.execute(
                            """
                            INSERT INTO document_versions (id, document_id, version,
                                                        content, metadata, created_at,
                                                        created_by_id, comment)
                            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                            ON CONFLICT (id) DO UPDATE
                            SET document_id = EXCLUDED.document_id,
                                version = EXCLUDED.version,
                                content = EXCLUDED.content,
                                metadata = EXCLUDED.metadata,
                                created_at = EXCLUDED.created_at,
                                created_by_id = EXCLUDED.created_by_id,
                                comment = EXCLUDED.comment
                            """,
                            version["id"],
                            version["document_id"],
                            version["version"],
                            version["content"],
                            version["metadata"],
                            version["created_at"],
                            version["created_by_id"],
                            version["comment"],
                        )

        # 导入文档变更记录
        changes_file = input_dir / "document_changes.json"
        if changes_file.exists():
            async with aiofiles.open(changes_file) as f:
                content = await f.read()
                changes = json.loads(content)
                async with self.pg_pool.acquire() as conn:
                    for change in tqdm(changes, desc="导入变更记录"):
                        await conn.execute(
                            """
                            INSERT INTO document_changes (id, document_id, from_version,
                                                       to_version, change_type, created_at,
                                                       created_by_id, details)
                            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                            ON CONFLICT (id) DO UPDATE
                            SET document_id = EXCLUDED.document_id,
                                from_version = EXCLUDED.from_version,
                                to_version = EXCLUDED.to_version,
                                change_type = EXCLUDED.change_type,
                                created_at = EXCLUDED.created_at,
                                created_by_id = EXCLUDED.created_by_id,
                                details = EXCLUDED.details
                            """,
                            change["id"],
                            change["document_id"],
                            change["from_version"],
                            change["to_version"],
                            change["change_type"],
                            change["created_at"],
                            change["created_by_id"],
                            change["details"],
                        )

        # 导入备份记录
        backups_file = input_dir / "backup_records.json"
        if backups_file.exists():
            async with aiofiles.open(backups_file) as f:
                content = await f.read()
                backups = json.loads(content)
                async with self.pg_pool.acquire() as conn:
                    for backup in tqdm(backups, desc="导入备份记录"):
                        await conn.execute(
                            """
                            INSERT INTO backup_records (id, backup_path, backup_type,
                                                     status, started_at, completed_at,
                                                     created_by_id, metadata, error_message)
                            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                            ON CONFLICT (id) DO UPDATE
                            SET backup_path = EXCLUDED.backup_path,
                                backup_type = EXCLUDED.backup_type,
                                status = EXCLUDED.status,
                                started_at = EXCLUDED.started_at,
                                completed_at = EXCLUDED.completed_at,
                                created_by_id = EXCLUDED.created_by_id,
                                metadata = EXCLUDED.metadata,
                                error_message = EXCLUDED.error_message
                            """,
                            backup["id"],
                            backup["backup_path"],
                            backup["backup_type"],
                            backup["status"],
                            backup["started_at"],
                            backup["completed_at"],
                            backup["created_by_id"],
                            backup["metadata"],
                            backup["error_message"],
                        )

        # 导入向量存储数据
        documents_file = input_dir / "documents.json"
        if documents_file.exists():
            async with aiofiles.open(documents_file) as f:
                content = await f.read()
                documents = json.loads(content)
                batch_size = 1000
                for i in tqdm(range(0, len(documents), batch_size), desc="导入向量数据"):
                    batch = documents[i:i + batch_size]
                    contents = [doc["content"] for doc in batch]
                    embeddings = [doc["embedding"] for doc in batch]
                    metadata = [doc["metadata"] for doc in batch]
                    self.milvus_collection.insert([contents, embeddings, metadata])

        logger.info(f"数据已从 {input_dir} 导入")


async def main() -> None:
    """主函数."""
    parser = argparse.ArgumentParser(description="数据迁移工具")
    parser.add_argument("action", choices=["export", "import"], help="操作类型")
    parser.add_argument("--dir", help="导入/导出目录")

    args = parser.parse_args()
    tool = MigrationTool()

    try:
        await tool.connect()

        if args.action == "export":
            await tool.export_data(args.dir)
        else:
            if not args.dir:
                raise ValueError("导入操作需要指定目录")
            await tool.import_data(args.dir)
    finally:
        await tool.close()


if __name__ == "__main__":
    asyncio.run(main()) 