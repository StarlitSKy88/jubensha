"""Redis客户端模块."""
from typing import Any, Optional

import redis.asyncio as redis
from redis.asyncio.connection import ConnectionPool
from redis.asyncio.client import Redis

from scriptai.config import settings


class RedisClient:
    """Redis客户端类."""

    def __init__(self) -> None:
        """初始化Redis客户端."""
        self._pool: Optional[ConnectionPool] = None
        self._client: Optional[Redis] = None

    async def init(self) -> None:
        """初始化Redis连接池."""
        if not self._pool:
            self._pool = redis.ConnectionPool(
                host=settings.REDIS_HOST,
                port=settings.REDIS_PORT,
                password=settings.REDIS_PASSWORD,
                decode_responses=True,
                encoding="utf-8",
            )

    @property
    def client(self) -> Redis:
        """获取Redis客户端."""
        if not self._client:
            if not self._pool:
                raise RuntimeError("Redis client not initialized")
            self._client = redis.Redis(connection_pool=self._pool)
        return self._client

    async def close(self) -> None:
        """关闭Redis连接."""
        if self._client:
            await self._client.close()
            self._client = None
        if self._pool:
            await self._pool.disconnect()
            self._pool = None

    async def get(self, key: str) -> Any:
        """获取键值."""
        return await self.client.get(key)

    async def set(
        self,
        key: str,
        value: Any,
        expire: Optional[int] = None,
    ) -> bool:
        """设置键值."""
        return await self.client.set(key, value, ex=expire)

    async def delete(self, key: str) -> bool:
        """删除键值."""
        return bool(await self.client.delete(key))

    async def exists(self, key: str) -> bool:
        """检查键是否存在."""
        return bool(await self.client.exists(key))

    async def expire(self, key: str, seconds: int) -> bool:
        """设置键的过期时间."""
        return bool(await self.client.expire(key, seconds))

    async def ttl(self, key: str) -> int:
        """获取键的剩余生存时间."""
        return await self.client.ttl(key)

    async def incr(self, key: str) -> int:
        """递增键的值."""
        return await self.client.incr(key)

    async def decr(self, key: str) -> int:
        """递减键的值."""
        return await self.client.decr(key)


# 创建全局Redis客户端实例
redis_client = RedisClient() 