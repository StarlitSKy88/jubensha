"""OpenAI模型实现."""
from typing import Any, Dict, List

from scriptai.core.openai import openai_client
from scriptai.services.rag.base import EmbeddingModel, LLMModel


class OpenAIEmbedding(EmbeddingModel):
    """OpenAI嵌入模型实现."""

    async def encode(self, texts: List[str]) -> List[List[float]]:
        """文本编码."""
        return await openai_client.create_embeddings(texts)

    async def encode_query(self, text: str) -> List[float]:
        """查询编码."""
        embeddings = await openai_client.create_embeddings([text])
        return embeddings[0]


class OpenAILLM(LLMModel):
    """OpenAI大语言模型实现."""

    async def generate(
        self,
        prompt: str,
        context: List[str],
        **kwargs: Dict[str, Any],
    ) -> str:
        """生成文本."""
        # 构建提示词
        system_prompt = """你是一个专业的剧本创作助手。
你的任务是根据用户的问题和提供的参考资料，给出专业、有见地的建议。
你的回答应该：
1. 准确理解用户的问题
2. 充分利用参考资料中的相关信息
3. 结合专业的剧本创作理论
4. 给出具体和可操作的建议
5. 使用清晰和专业的语言

参考资料如下：
{context}

请记住：
- 保持专业性和客观性
- 给出具体的例子和解释
- 注意建议的可行性
- 尊重创作者的创意"""

        # 格式化提示词
        formatted_system_prompt = system_prompt.format(
            context="\n\n".join(context),
        )

        # 调用API
        response = await openai_client.create_completion(
            prompt=prompt,
            system_prompt=formatted_system_prompt,
            **kwargs,
        )

        return response

    async def rewrite_query(self, query: str) -> str:
        """重写查询."""
        system_prompt = """你是一个专业的剧本创作助手。
你的任务是重写用户的查询，使其更加清晰和具体。
重写时应该：
1. 保持原始问题的核心意图
2. 添加必要的上下文
3. 使用更专业的术语
4. 明确具体的需求
5. 扩展相关的方面

请直接返回重写后的查询，不要添加任何解释或其他内容。"""

        # 调用API
        response = await openai_client.create_completion(
            prompt=query,
            system_prompt=system_prompt,
            max_tokens=100,
        )

        return response 