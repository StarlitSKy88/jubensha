"""OpenAI服务测试."""
import pytest
from openai import AsyncOpenAI

from scriptai.core.openai import OpenAIClient


@pytest.fixture
def openai_client() -> OpenAIClient:
    """创建OpenAI客户端."""
    return OpenAIClient()


@pytest.mark.asyncio
async def test_create_embeddings(openai_client: OpenAIClient) -> None:
    """测试创建文本嵌入."""
    texts = ["Hello, world!", "This is a test."]
    embeddings = await openai_client.create_embeddings(texts)
    assert len(embeddings) == len(texts)
    assert all(isinstance(embedding, list) for embedding in embeddings)
    assert all(isinstance(value, float) for embedding in embeddings for value in embedding)


@pytest.mark.asyncio
async def test_create_completion(openai_client: OpenAIClient) -> None:
    """测试创建文本补全."""
    prompt = "What is the capital of France?"
    completion = await openai_client.create_completion(prompt)
    assert isinstance(completion, str)
    assert len(completion) > 0


@pytest.mark.asyncio
async def test_create_completion_with_cache(openai_client: OpenAIClient) -> None:
    """测试带缓存的文本补全."""
    prompt = "What is the capital of France?"
    completion1 = await openai_client.create_completion(prompt)
    completion2 = await openai_client.create_completion(prompt)
    assert completion1 == completion2


@pytest.mark.asyncio
async def test_create_embeddings_with_cache(openai_client: OpenAIClient) -> None:
    """测试带缓存的文本嵌入."""
    texts = ["Hello, world!", "This is a test."]
    embeddings1 = await openai_client.create_embeddings(texts)
    embeddings2 = await openai_client.create_embeddings(texts)
    assert embeddings1 == embeddings2


@pytest.mark.asyncio
async def test_client_initialization(openai_client: OpenAIClient) -> None:
    """测试客户端初始化."""
    assert openai_client._client is None
    client = openai_client.client
    assert isinstance(client, AsyncOpenAI)
    assert openai_client._client is client


@pytest.mark.asyncio
async def test_client_close(openai_client: OpenAIClient) -> None:
    """测试客户端关闭."""
    client = openai_client.client
    assert openai_client._client is client
    await openai_client.close()
    assert openai_client._client is None 