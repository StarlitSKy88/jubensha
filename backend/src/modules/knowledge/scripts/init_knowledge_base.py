#!/usr/bin/env python3
"""
知识库初始化脚本
用于导入和处理初始知识库数据
"""
import asyncio
import logging
from pathlib import Path
from typing import List, Dict, Any

from app.services.rag import RAGService, DocumentProcessor
from app.core.config import settings

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# 知识库数据目录
KNOWLEDGE_BASE_DIR = Path("knowledge_base")

# 知识分类
CATEGORIES = {
    "theory": {
        "path": KNOWLEDGE_BASE_DIR / "theory",
        "description": "剧本写作理论",
        "metadata": {"type": "theory", "importance": "high"}
    },
    "examples": {
        "path": KNOWLEDGE_BASE_DIR / "examples",
        "description": "经典剧本案例",
        "metadata": {"type": "example", "importance": "medium"}
    },
    "guidelines": {
        "path": KNOWLEDGE_BASE_DIR / "guidelines",
        "description": "行业规范和标准",
        "metadata": {"type": "guideline", "importance": "high"}
    }
}


async def scan_files(directory: Path) -> List[Path]:
    """扫描目录中的文件"""
    if not directory.exists():
        logger.warning(f"目录不存在: {directory}")
        return []
        
    files = []
    for file_path in directory.rglob("*"):
        if file_path.is_file() and file_path.suffix in [".txt", ".md"]:
            files.append(file_path)
    return files


async def read_file(file_path: Path) -> str:
    """读取文件内容"""
    try:
        return file_path.read_text(encoding="utf-8")
    except Exception as e:
        logger.error(f"读取文件失败 {file_path}: {e}")
        return ""


async def process_category(
    category: str,
    rag_service: RAGService
) -> None:
    """处理一个知识分类"""
    category_info = CATEGORIES[category]
    logger.info(f"处理分类: {category} - {category_info['description']}")
    
    # 扫描文件
    files = await scan_files(category_info["path"])
    logger.info(f"找到 {len(files)} 个文件")
    
    # 处理每个文件
    for file_path in files:
        try:
            # 读取文件
            content = await read_file(file_path)
            if not content:
                continue
                
            # 准备元数据
            metadata = {
                **category_info["metadata"],
                "filename": file_path.name,
                "category": category,
                "path": str(file_path.relative_to(KNOWLEDGE_BASE_DIR))
            }
            
            # 添加到知识库
            success = await rag_service.add_document(content, metadata)
            
            if success:
                logger.info(f"成功添加文件: {file_path.name}")
            else:
                logger.warning(f"添加文件失败: {file_path.name}")
                
        except Exception as e:
            logger.error(f"处理文件失败 {file_path}: {e}")


async def create_knowledge_base_structure() -> None:
    """创建知识库目录结构"""
    for category_info in CATEGORIES.values():
        category_info["path"].mkdir(parents=True, exist_ok=True)


async def main():
    """主函数"""
    try:
        # 创建目录结构
        await create_knowledge_base_structure()
        
        # 初始化RAG服务
        rag_service = RAGService()
        await rag_service.initialize()
        
        # 处理每个分类
        for category in CATEGORIES:
            await process_category(category, rag_service)
            
        logger.info("知识库初始化完成")
        
    except Exception as e:
        logger.error(f"知识库初始化失败: {e}")
        raise
    finally:
        # 关闭服务
        if 'rag_service' in locals():
            await rag_service.close()


if __name__ == "__main__":
    asyncio.run(main()) 