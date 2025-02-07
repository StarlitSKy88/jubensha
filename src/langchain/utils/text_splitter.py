from typing import List
from langchain.text_splitter import RecursiveCharacterTextSplitter

class TextSplitter:
    def __init__(self, 
                 chunk_size: int = 500,
                 chunk_overlap: int = 50,
                 separators: List[str] = ["\n\n", "\n", "。", "！", "？", ".", "!", "?"]):
        """初始化文本分割器
        
        Args:
            chunk_size: 每个文本块的大小
            chunk_overlap: 文本块之间的重叠大小
            separators: 分割符列表
        """
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=separators
        )
    
    def split_text(self, text: str) -> List[str]:
        """分割文本
        
        Args:
            text: 要分割的文本
            
        Returns:
            分割后的文本块列表
        """
        return self.splitter.split_text(text)
    
    def split_texts(self, texts: List[str]) -> List[str]:
        """分割多个文本
        
        Args:
            texts: 要分割的文本列表
            
        Returns:
            分割后的文本块列表
        """
        result = []
        for text in texts:
            result.extend(self.split_text(text))
        return result 