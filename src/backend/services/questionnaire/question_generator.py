from typing import List, Dict, Optional
from pydantic import BaseModel
import random

class Question(BaseModel):
    """问题模型"""
    id: str
    content: str
    type: str  # 'single_choice', 'multiple_choice', 'text'
    options: Optional[List[str]] = None
    category: str  # 'core', 'role', 'interaction'
    tags: List[str]
    difficulty: int  # 1-5
    
class QuestionGenerator:
    """问题生成器"""
    def __init__(self):
        self.core_templates = [
            "你更倾向于在{situation}时选择什么行动？",
            "面对{conflict}，你会如何处理？",
            "在{scenario}的情况下，你最看重什么？",
            "如果发现{discovery}，你的第一反应是什么？"
        ]
        
        self.situations = [
            "紧急危机",
            "道德两难",
            "利益冲突",
            "信任考验",
            "秘密泄露"
        ]
        
        self.role_templates = [
            "你认为{role_type}应该具备什么特质？",
            "作为{role_type}，你会如何处理{situation}？",
            "在扮演{role_type}时，你最注重什么？"
        ]
        
        self.role_types = [
            "侦探",
            "嫌疑人",
            "证人",
            "受害者",
            "旁观者"
        ]
    
    def generate_core_question(self) -> Question:
        """生成核心问题"""
        template = random.choice(self.core_templates)
        situation = random.choice(self.situations)
        
        content = template.format(
            situation=situation,
            conflict="两个朋友之间的矛盾",
            scenario="需要为他人保守重要秘密",
            discovery="朋友的不当行为"
        )
        
        return Question(
            id=f"core_{random.randint(1000, 9999)}",
            content=content,
            type="single_choice",
            options=[
                "立即采取行动",
                "谨慎观察",
                "寻求帮助",
                "保持中立"
            ],
            category="core",
            tags=["personality", "decision_making"],
            difficulty=random.randint(1, 5)
        )
    
    def generate_role_question(self) -> Question:
        """生成角色相关问题"""
        template = random.choice(self.role_templates)
        role_type = random.choice(self.role_types)
        situation = random.choice(self.situations)
        
        content = template.format(
            role_type=role_type,
            situation=situation
        )
        
        return Question(
            id=f"role_{random.randint(1000, 9999)}",
            content=content,
            type="multiple_choice",
            options=[
                "正义感",
                "洞察力",
                "同理心",
                "决断力",
                "冷静"
            ],
            category="role",
            tags=["role_playing", "character_traits"],
            difficulty=random.randint(1, 5)
        )
    
    def generate_question_set(self, count: int = 5) -> List[Question]:
        """生成一组问题"""
        questions = []
        for _ in range(count):
            if random.random() < 0.6:  # 60%概率生成核心问题
                questions.append(self.generate_core_question())
            else:
                questions.append(self.generate_role_question())
        return questions 