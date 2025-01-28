from typing import Dict, Any, Optional
import json
from datetime import datetime

class ContentProcessor:
    """内容处理器基类"""
    def process(self, raw_content: Dict[str, Any]) -> Dict[str, Any]:
        """处理内容的基础方法"""
        raise NotImplementedError

class TextContentProcessor(ContentProcessor):
    """文本内容处理器"""
    def process(self, raw_content: Dict[str, Any]) -> Dict[str, Any]:
        """处理文本内容"""
        text = raw_content.get('text', '')
        
        # 基础文本处理
        processed = {
            'text': text.strip(),
            'word_count': len(text.split()),
            'char_count': len(text),
            'processed_at': datetime.utcnow().isoformat()
        }
        
        return processed

class ImageContentProcessor(ContentProcessor):
    """图片内容处理器"""
    def process(self, raw_content: Dict[str, Any]) -> Dict[str, Any]:
        """处理图片内容"""
        image_url = raw_content.get('image_url', '')
        
        # 基础图片信息处理
        processed = {
            'image_url': image_url,
            'format': image_url.split('.')[-1] if '.' in image_url else 'unknown',
            'processed_at': datetime.utcnow().isoformat()
        }
        
        return processed

class VideoContentProcessor(ContentProcessor):
    """视频内容处理器"""
    def process(self, raw_content: Dict[str, Any]) -> Dict[str, Any]:
        """处理视频内容"""
        video_url = raw_content.get('video_url', '')
        duration = raw_content.get('duration', 0)
        
        # 基础视频信息处理
        processed = {
            'video_url': video_url,
            'duration': duration,
            'format': video_url.split('.')[-1] if '.' in video_url else 'unknown',
            'processed_at': datetime.utcnow().isoformat()
        }
        
        return processed

class AudioContentProcessor(ContentProcessor):
    """音频内容处理器"""
    def process(self, raw_content: Dict[str, Any]) -> Dict[str, Any]:
        """处理音频内容"""
        audio_url = raw_content.get('audio_url', '')
        duration = raw_content.get('duration', 0)
        
        # 基础音频信息处理
        processed = {
            'audio_url': audio_url,
            'duration': duration,
            'format': audio_url.split('.')[-1] if '.' in audio_url else 'unknown',
            'processed_at': datetime.utcnow().isoformat()
        }
        
        return processed

class ContentProcessorFactory:
    """内容处理器工厂"""
    _processors = {
        'text': TextContentProcessor(),
        'image': ImageContentProcessor(),
        'video': VideoContentProcessor(),
        'audio': AudioContentProcessor()
    }

    @classmethod
    def get_processor(cls, content_type: str) -> Optional[ContentProcessor]:
        """获取对应类型的内容处理器"""
        return cls._processors.get(content_type) 