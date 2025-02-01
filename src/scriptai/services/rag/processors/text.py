"""文本处理器实现."""
import re
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field

from scriptai.services.rag.base import TextProcessor


class TextProcessingConfig(BaseModel):
    """文本处理配置."""

    # 分块配置
    chunk_size: int = Field(default=500, ge=100, le=2000)
    chunk_overlap: int = Field(default=50, ge=0, le=200)
    min_chunk_size: int = Field(default=100, ge=50, le=500)

    # 清理配置
    remove_extra_spaces: bool = True
    remove_urls: bool = False
    remove_email: bool = False
    normalize_whitespace: bool = True

    # 语言配置
    language: str = "zh"
    preserve_line_breaks: bool = True


class DefaultTextProcessor(TextProcessor):
    """默认文本处理器实现."""

    def __init__(self, config: Optional[TextProcessingConfig] = None) -> None:
        """初始化文本处理器."""
        self.config = config or TextProcessingConfig()

    async def split(self, text: str) -> List[str]:
        """文本分块."""
        if not text:
            return []

        chunks = []
        current_chunk = []
        current_size = 0

        # 按句子分割
        sentences = re.split(r"([。！？.!?])", text)

        for i in range(0, len(sentences), 2):
            sentence = sentences[i]
            if i + 1 < len(sentences):
                sentence += sentences[i + 1]

            sentence_size = len(sentence)

            if current_size + sentence_size > self.config.chunk_size:
                if current_chunk:
                    chunks.append("".join(current_chunk))
                current_chunk = [sentence]
                current_size = sentence_size
            else:
                current_chunk.append(sentence)
                current_size += sentence_size

        if current_chunk:
            chunks.append("".join(current_chunk))

        # 后处理
        return await self._post_process_chunks(chunks)

    async def clean(self, text: str) -> str:
        """文本清理."""
        if not text:
            return ""

        # 保存原始换行符
        if self.config.preserve_line_breaks:
            text = text.replace("\n", " <br> ")

        # 移除多余空格
        if self.config.remove_extra_spaces:
            text = re.sub(r"\s+", " ", text)

        # 移除URL
        if self.config.remove_urls:
            text = re.sub(
                r"http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+",
                "",
                text,
            )

        # 移除邮箱
        if self.config.remove_email:
            text = re.sub(r"[\w\.-]+@[\w\.-]+\.\w+", "", text)

        # 标准化空白字符
        if self.config.normalize_whitespace:
            text = " ".join(text.split())

        # 恢复换行符
        if self.config.preserve_line_breaks:
            text = text.replace(" <br> ", "\n")

        return text.strip()

    async def extract_metadata(self, text: str) -> Dict[str, Any]:
        """提取元数据."""
        metadata = {
            "length": len(text),
            "language": self.config.language,
        }

        # 提取标题
        title_match = re.search(r"^#\s+(.+)$", text, re.MULTILINE)
        if title_match:
            metadata["title"] = title_match.group(1)

        # 提取标签
        tag_matches = re.findall(r"#(\w+)", text)
        if tag_matches:
            metadata["tags"] = tag_matches

        # 提取日期
        date_match = re.search(
            r"\d{4}[-/]\d{1,2}[-/]\d{1,2}",
            text,
        )
        if date_match:
            metadata["date"] = date_match.group()

        return metadata

    async def _post_process_chunks(self, chunks: List[str]) -> List[str]:
        """后处理分块."""
        processed_chunks = []

        for chunk in chunks:
            # 跳过过小的块
            if len(chunk) < self.config.min_chunk_size:
                continue

            # 清理块
            chunk = chunk.strip()

            # 添加到结果
            processed_chunks.append(chunk)

        return processed_chunks 