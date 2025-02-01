"""文件存储服务."""
import os
from pathlib import Path
from typing import Optional
import aiofiles
from fastapi import UploadFile

from scriptai.config import settings

class StorageService:
    """文件存储服务类."""
    
    def __init__(self):
        """初始化存储服务."""
        self.upload_dir = Path(settings.UPLOAD_DIR)
        self.upload_dir.mkdir(parents=True, exist_ok=True)
        
    async def upload_file(
        self,
        file: UploadFile,
        path: str,
        chunk_size: int = 1024 * 1024
    ) -> str:
        """上传文件.
        
        Args:
            file: 上传的文件
            path: 存储路径
            chunk_size: 分块大小
            
        Returns:
            文件的URL
            
        Raises:
            IOError: 如果文件写入失败
        """
        # 确保目录存在
        file_path = self.upload_dir / path
        file_path.parent.mkdir(parents=True, exist_ok=True)
        
        # 写入文件
        try:
            async with aiofiles.open(file_path, 'wb') as f:
                while content := await file.read(chunk_size):
                    await f.write(content)
        except Exception as e:
            # 清理失败的文件
            if file_path.exists():
                file_path.unlink()
            raise IOError(f"文件上传失败: {str(e)}")
            
        # 返回文件URL
        return f"/uploads/{path}"
        
    async def delete_file(self, url: str) -> bool:
        """删除文件.
        
        Args:
            url: 文件URL
            
        Returns:
            如果删除成功返回True，否则返回False
        """
        if not url.startswith("/uploads/"):
            return False
            
        path = url[9:]  # 去掉"/uploads/"前缀
        file_path = self.upload_dir / path
        
        try:
            if file_path.exists():
                file_path.unlink()
            return True
        except Exception:
            return False
            
    def get_file_path(self, url: str) -> Optional[Path]:
        """获取文件路径.
        
        Args:
            url: 文件URL
            
        Returns:
            文件路径，如果文件不存在返回None
        """
        if not url.startswith("/uploads/"):
            return None
            
        path = url[9:]  # 去掉"/uploads/"前缀
        file_path = self.upload_dir / path
        
        return file_path if file_path.exists() else None

# 全局存储服务实例
storage_service = StorageService() 