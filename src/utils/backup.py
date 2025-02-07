import os
import shutil
import json
import zipfile
from datetime import datetime
from typing import List, Optional
from .logger import default_logger

class BackupManager:
    def __init__(self, 
                 backup_dir: str = "backups",
                 max_backups: int = 5):
        """初始化备份管理器
        
        Args:
            backup_dir: 备份目录
            max_backups: 最大保留备份数量
        """
        self.backup_dir = backup_dir
        self.max_backups = max_backups
        os.makedirs(backup_dir, exist_ok=True)
    
    def create_backup(self, 
                     data_dir: str,
                     description: Optional[str] = None) -> str:
        """创建备份
        
        Args:
            data_dir: 要备份的数据目录
            description: 备份描述
            
        Returns:
            备份文件路径
        """
        try:
            # 生成备份文件名
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_name = f"backup_{timestamp}.zip"
            backup_path = os.path.join(self.backup_dir, backup_name)
            
            # 创建备份文件
            with zipfile.ZipFile(backup_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                for root, _, files in os.walk(data_dir):
                    for file in files:
                        file_path = os.path.join(root, file)
                        arcname = os.path.relpath(file_path, data_dir)
                        zipf.write(file_path, arcname)
            
            # 创建备份元数据
            metadata = {
                'timestamp': timestamp,
                'description': description,
                'source_dir': data_dir,
                'file_count': len(files)
            }
            metadata_path = os.path.join(
                self.backup_dir,
                f"backup_{timestamp}_metadata.json"
            )
            with open(metadata_path, 'w', encoding='utf-8') as f:
                json.dump(metadata, f, ensure_ascii=False, indent=2)
            
            # 清理旧备份
            self._cleanup_old_backups()
            
            default_logger.info(f"Backup created: {backup_path}")
            return backup_path
        
        except Exception as e:
            default_logger.error(f"Backup creation failed: {str(e)}")
            raise
    
    def restore_backup(self, 
                      backup_path: str,
                      restore_dir: str) -> bool:
        """恢复备份
        
        Args:
            backup_path: 备份文件路径
            restore_dir: 恢复目标目录
            
        Returns:
            是否恢复成功
        """
        try:
            # 确保备份文件存在
            if not os.path.exists(backup_path):
                raise FileNotFoundError(f"Backup file not found: {backup_path}")
            
            # 清空恢复目录
            if os.path.exists(restore_dir):
                shutil.rmtree(restore_dir)
            os.makedirs(restore_dir)
            
            # 解压备份文件
            with zipfile.ZipFile(backup_path, 'r') as zipf:
                zipf.extractall(restore_dir)
            
            default_logger.info(f"Backup restored to: {restore_dir}")
            return True
        
        except Exception as e:
            default_logger.error(f"Backup restoration failed: {str(e)}")
            raise
    
    def list_backups(self) -> List[dict]:
        """列出所有备份
        
        Returns:
            备份列表
        """
        backups = []
        for file in os.listdir(self.backup_dir):
            if file.endswith('_metadata.json'):
                metadata_path = os.path.join(self.backup_dir, file)
                with open(metadata_path, 'r', encoding='utf-8') as f:
                    metadata = json.load(f)
                backups.append(metadata)
        return sorted(backups, key=lambda x: x['timestamp'], reverse=True)
    
    def delete_backup(self, backup_path: str) -> bool:
        """删除备份
        
        Args:
            backup_path: 备份文件路径
            
        Returns:
            是否删除成功
        """
        try:
            if not os.path.exists(backup_path):
                raise FileNotFoundError(f"Backup file not found: {backup_path}")
            
            # 删除备份文件
            os.remove(backup_path)
            
            # 删除元数据文件
            timestamp = os.path.splitext(os.path.basename(backup_path))[0].split('_')[1]
            metadata_path = os.path.join(
                self.backup_dir,
                f"backup_{timestamp}_metadata.json"
            )
            if os.path.exists(metadata_path):
                os.remove(metadata_path)
            
            default_logger.info(f"Backup deleted: {backup_path}")
            return True
        
        except Exception as e:
            default_logger.error(f"Backup deletion failed: {str(e)}")
            raise
    
    def _cleanup_old_backups(self):
        """清理旧备份"""
        backups = self.list_backups()
        if len(backups) > self.max_backups:
            for backup in backups[self.max_backups:]:
                backup_path = os.path.join(
                    self.backup_dir,
                    f"backup_{backup['timestamp']}.zip"
                )
                self.delete_backup(backup_path)

# 创建默认备份管理器实例
default_backup_manager = BackupManager() 