from typing import List, Dict, Optional, Any
import json
import os
from datetime import datetime
import difflib

class VersionManager:
    def __init__(self, storage_path: str):
        """初始化版本管理器
        
        Args:
            storage_path: 版本存储路径
        """
        self.storage_path = storage_path
        self.current_version = {}
        self.version_history = []
        self._init_storage()
    
    def _init_storage(self):
        """初始化存储目录"""
        if not os.path.exists(self.storage_path):
            os.makedirs(self.storage_path)
            self._save_version_history()
    
    def _save_version_history(self):
        """保存版本历史"""
        history_path = os.path.join(self.storage_path, "version_history.json")
        with open(history_path, "w", encoding="utf-8") as f:
            json.dump(self.version_history, f, ensure_ascii=False, indent=2)
    
    def _load_version_history(self):
        """加载版本历史"""
        history_path = os.path.join(self.storage_path, "version_history.json")
        if os.path.exists(history_path):
            with open(history_path, "r", encoding="utf-8") as f:
                self.version_history = json.load(f)
    
    def create_version(self, content: str, metadata: Optional[Dict[str, Any]] = None) -> str:
        """创建新版本
        
        Args:
            content: 版本内容
            metadata: 版本元数据
            
        Returns:
            版本ID
        """
        version_id = datetime.now().strftime("%Y%m%d%H%M%S")
        version_data = {
            "id": version_id,
            "content": content,
            "metadata": metadata or {},
            "timestamp": datetime.now().isoformat(),
            "parent": self.version_history[-1]["id"] if self.version_history else None
        }
        
        # 保存版本内容
        version_path = os.path.join(self.storage_path, f"{version_id}.json")
        with open(version_path, "w", encoding="utf-8") as f:
            json.dump(version_data, f, ensure_ascii=False, indent=2)
        
        # 更新版本历史
        self.version_history.append({
            "id": version_id,
            "metadata": metadata or {},
            "timestamp": version_data["timestamp"],
            "parent": version_data["parent"]
        })
        self._save_version_history()
        
        self.current_version = version_data
        return version_id
    
    def get_version(self, version_id: str) -> Dict[str, Any]:
        """获取指定版本
        
        Args:
            version_id: 版本ID
            
        Returns:
            版本数据
        """
        version_path = os.path.join(self.storage_path, f"{version_id}.json")
        if not os.path.exists(version_path):
            raise ValueError(f"Version {version_id} not found")
        
        with open(version_path, "r", encoding="utf-8") as f:
            return json.load(f)
    
    def get_diff(self, version_id1: str, version_id2: str) -> List[str]:
        """获取两个版本之间的差异
        
        Args:
            version_id1: 第一个版本ID
            version_id2: 第二个版本ID
            
        Returns:
            差异列表
        """
        v1 = self.get_version(version_id1)
        v2 = self.get_version(version_id2)
        
        diff = difflib.unified_diff(
            v1["content"].splitlines(keepends=True),
            v2["content"].splitlines(keepends=True),
            fromfile=version_id1,
            tofile=version_id2
        )
        return list(diff)
    
    def get_history(self) -> List[Dict[str, Any]]:
        """获取版本历史
        
        Returns:
            版本历史列表
        """
        return self.version_history
    
    def rollback(self, version_id: str) -> Dict[str, Any]:
        """回滚到指定版本
        
        Args:
            version_id: 目标版本ID
            
        Returns:
            回滚后的版本数据
        """
        target_version = self.get_version(version_id)
        self.current_version = target_version
        return target_version 