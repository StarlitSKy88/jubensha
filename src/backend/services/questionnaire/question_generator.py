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

        self.interaction_templates = [
            "如果{role_type_a}向你{action}，你会如何回应？",
            "当{role_type_a}和{role_type_b}发生{conflict}时，你会怎么做？",
            "在与{role_type_a}的对话中，你会如何获取{info_type}？",
            "如何说服{role_type_a}配合你的调查？"
        ]

        self.actions = [
            "提出质疑",
            "寻求帮助",
            "透露秘密",
            "表示怀疑",
            "提供线索"
        ]

        self.info_types = [
            "关键信息",
            "不在场证明",
            "目击证词",
            "事件细节",
            "人物关系"
        ]

        self.conflicts = [
            "言语冲突",
            "利益纷争",
            "信息对抗",
            "立场对立",
            "情感矛盾"
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

    def generate_interaction_question(self) -> Question:
        """生成互动问题"""
        template = random.choice(self.interaction_templates)
        role_type_a = random.choice(self.role_types)
        role_type_b = random.choice([r for r in self.role_types if r != role_type_a])
        action = random.choice(self.actions)
        conflict = random.choice(self.conflicts)
        info_type = random.choice(self.info_types)

        content = template.format(
            role_type_a=role_type_a,
            role_type_b=role_type_b,
            action=action,
            conflict=conflict,
            info_type=info_type
        )

        return Question(
            id=f"interaction_{random.randint(1000, 9999)}",
            content=content,
            type="text",  # 互动问题使用文本输入
            category="interaction",
            tags=["interaction", "communication", "strategy"],
            difficulty=random.randint(2, 5)  # 互动问题通常较难
        )
    
    def generate_question_set(self, count: int = 5) -> List[Question]:
        """生成一组问题"""
        questions = []
        for _ in range(count):
            rand = random.random()
            if rand < 0.5:  # 50%概率生成核心问题
                questions.append(self.generate_core_question())
            elif rand < 0.8:  # 30%概率生成角色问题
                questions.append(self.generate_role_question())
            else:  # 20%概率生成互动问题
                questions.append(self.generate_interaction_question())
        return questions 