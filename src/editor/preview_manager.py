from typing import Dict, Any, Optional, List
import re
import json
from datetime import datetime
from src.utils.logger import default_logger

class PreviewManager:
    def __init__(self):
        """初始化预览管理器"""
        self.current_content = ""
        self.preview_cache = {}
        self.last_update = None
        self.watchers = []
    
    def update_content(self, content: str) -> Dict[str, Any]:
        """更新内容并生成预览
        
        Args:
            content: 新的内容
            
        Returns:
            预览数据
        """
        try:
            self.current_content = content
            self.last_update = datetime.now()
            
            # 生成预览数据
            preview_data = self._generate_preview(content)
            
            # 更新缓存
            cache_key = hash(content)
            self.preview_cache[cache_key] = preview_data
            
            # 通知观察者
            self._notify_watchers(preview_data)
            
            default_logger.info("Preview updated successfully")
            return preview_data
        except Exception as e:
            default_logger.error(f"Preview update failed: {str(e)}")
            raise
    
    def _generate_preview(self, content: str) -> Dict[str, Any]:
        """生成预览数据
        
        Args:
            content: 原始内容
            
        Returns:
            预览数据
        """
        # 解析剧本结构
        scenes = self._parse_scenes(content)
        characters = self._parse_characters(content)
        metadata = self._parse_metadata(content)
        
        return {
            "scenes": scenes,
            "characters": characters,
            "metadata": metadata,
            "timestamp": datetime.now().isoformat()
        }
    
    def _parse_scenes(self, content: str) -> List[Dict[str, Any]]:
        """解析场景
        
        Args:
            content: 原始内容
            
        Returns:
            场景列表
        """
        scenes = []
        current_scene = None
        
        for line in content.split("\n"):
            # 场景标记
            if line.strip().startswith("## 场景"):
                if current_scene:
                    scenes.append(current_scene)
                current_scene = {
                    "title": line.strip("# "),
                    "content": [],
                    "characters": set()
                }
            # 对话标记
            elif line.strip().startswith(">") and current_scene:
                # 提取说话角色
                match = re.match(r">\s*\**([\w\s]+)\**\s*[:：]", line)
                if match:
                    character = match.group(1).strip()
                    current_scene["characters"].add(character)
                current_scene["content"].append(line)
            # 其他内容
            elif current_scene:
                current_scene["content"].append(line)
        
        # 添加最后一个场景
        if current_scene:
            scenes.append(current_scene)
        
        # 转换character集合为列表
        for scene in scenes:
            scene["characters"] = list(scene["characters"])
        
        return scenes
    
    def _parse_characters(self, content: str) -> List[Dict[str, Any]]:
        """解析角色
        
        Args:
            content: 原始内容
            
        Returns:
            角色列表
        """
        characters = []
        character_section = False
        current_character = None
        
        for line in content.split("\n"):
            # 角色部分标记
            if line.strip() == "# 角色":
                character_section = True
                continue
            # 下一个主要部分
            elif line.strip().startswith("# ") and character_section:
                character_section = False
            # 角色定义
            elif character_section and line.strip().startswith("## "):
                if current_character:
                    characters.append(current_character)
                current_character = {
                    "name": line.strip("# "),
                    "description": [],
                    "relationships": []
                }
            # 关系定义
            elif character_section and line.strip().startswith("- 关系"):
                if current_character:
                    current_character["relationships"].append(
                        line.strip("- 关系：")
                    )
            # 角色描述
            elif character_section and current_character:
                current_character["description"].append(line)
        
        # 添加最后一个角色
        if current_character:
            characters.append(current_character)
        
        return characters
    
    def _parse_metadata(self, content: str) -> Dict[str, Any]:
        """解析元数据
        
        Args:
            content: 原始内容
            
        Returns:
            元数据字典
        """
        metadata = {
            "title": "",
            "author": "",
            "genre": "",
            "description": [],
            "tags": []
        }
        
        metadata_section = False
        for line in content.split("\n"):
            # 元数据部分标记
            if line.strip() == "# 元数据":
                metadata_section = True
                continue
            # 下一个主要部分
            elif line.strip().startswith("# ") and metadata_section:
                metadata_section = False
            # 解析元数据
            elif metadata_section and ":" in line:
                key, value = line.split(":", 1)
                key = key.strip().lower()
                value = value.strip()
                if key in metadata:
                    if isinstance(metadata[key], list):
                        metadata[key].append(value)
                    else:
                        metadata[key] = value
        
        return metadata
    
    def add_watcher(self, callback):
        """添加预览观察者
        
        Args:
            callback: 回调函数
        """
        if callback not in self.watchers:
            self.watchers.append(callback)
    
    def remove_watcher(self, callback):
        """移除预览观察者
        
        Args:
            callback: 回调函数
        """
        if callback in self.watchers:
            self.watchers.remove(callback)
    
    def _notify_watchers(self, preview_data: Dict[str, Any]):
        """通知所有观察者
        
        Args:
            preview_data: 预览数据
        """
        for callback in self.watchers:
            try:
                callback(preview_data)
            except Exception as e:
                default_logger.error(f"Watcher notification failed: {str(e)}")
    
    def get_current_preview(self) -> Optional[Dict[str, Any]]:
        """获取当前预览
        
        Returns:
            预览数据
        """
        if not self.current_content:
            return None
        
        cache_key = hash(self.current_content)
        return self.preview_cache.get(cache_key)
    
    def clear_cache(self):
        """清空预览缓存"""
        self.preview_cache.clear()
        default_logger.info("Preview cache cleared")

# 创建默认预览管理器
default_preview_manager = PreviewManager() 