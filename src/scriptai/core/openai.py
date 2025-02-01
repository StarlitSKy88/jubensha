"""OpenAI服务模块."""
import asyncio
from typing import Any, Dict, List, Optional

import openai
from loguru import logger
from openai import AsyncOpenAI
from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

from scriptai.config import settings
from scriptai.core.redis import redis_client


class OpenAIClient:
    """OpenAI客户端类."""

    def __init__(self) -> None:
        """初始化OpenAI客户端."""
        self._client: Optional[AsyncOpenAI] = None
        self._semaphore = asyncio.Semaphore(settings.OPENAI_MAX_CONCURRENT)

    @property
    def client(self) -> AsyncOpenAI:
        """获取OpenAI客户端."""
        if not self._client:
            self._client = AsyncOpenAI(
                api_key=settings.OPENAI_API_KEY,
                base_url=settings.OPENAI_API_BASE,
                max_retries=settings.OPENAI_MAX_RETRIES,
                timeout=settings.OPENAI_TIMEOUT,
            )
        return self._client

    async def _get_cache(self, key: str) -> Optional[str]:
        """获取缓存."""
        if not settings.OPENAI_ENABLE_CACHE:
            return None
        return await redis_client.get(key)

    async def _set_cache(self, key: str, value: str) -> None:
        """设置缓存."""
        if not settings.OPENAI_ENABLE_CACHE:
            return
        await redis_client.set(
            key,
            value,
            expire=settings.OPENAI_CACHE_TTL,
        )

    @retry(
        retry=retry_if_exception_type(openai.RateLimitError),
        wait=wait_exponential(multiplier=1, min=4, max=60),
        stop=stop_after_attempt(5),
    )
    async def create_embeddings(
        self,
        texts: List[str],
        model: str = settings.OPENAI_EMBEDDING_MODEL,
    ) -> List[List[float]]:
        """创建文本嵌入."""
        async with self._semaphore:
            embeddings = []
            for i in range(0, len(texts), settings.OPENAI_BATCH_SIZE):
                batch = texts[i : i + settings.OPENAI_BATCH_SIZE]
                batch_embeddings = []

                for text in batch:
                    # 尝试从缓存获取
                    cache_key = f"embedding:{model}:{text}"
                    if cached := await self._get_cache(cache_key):
                        batch_embeddings.append(eval(cached))
                        continue

                    # 调用API
                    response = await self.client.embeddings.create(
                        model=model,
                        input=text,
                    )
                    embedding = response.data[0].embedding

                    # 设置缓存
                    await self._set_cache(cache_key, str(embedding))
                    batch_embeddings.append(embedding)

                embeddings.extend(batch_embeddings)

            return embeddings

    @retry(
        retry=retry_if_exception_type(openai.RateLimitError),
        wait=wait_exponential(multiplier=1, min=4, max=60),
        stop=stop_after_attempt(5),
    )
    async def create_completion(
        self,
        prompt: str,
        model: str = "gpt-4-turbo-preview",
        **kwargs: Dict[str, Any],
    ) -> str:
        """创建文本补全."""
        async with self._semaphore:
            # 尝试从缓存获取
            cache_key = f"completion:{model}:{prompt}"
            if cached := await self._get_cache(cache_key):
                return cached

            # 调用API
            response = await self.client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                **kwargs,
            )
            completion = response.choices[0].message.content

            # 设置缓存
            await self._set_cache(cache_key, completion)
            return completion

    async def close(self) -> None:
        """关闭客户端."""
        if self._client:
            await self._client.close()
            self._client = None


# 创建全局OpenAI客户端实例
openai_client = OpenAIClient() 