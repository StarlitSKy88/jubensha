from typing import Dict, List
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from ...models import Questionnaire, QuestionResponse, QuestionTemplate

class QuestionnaireAnalyzer:
    def __init__(self):
        self.trait_weights = {
            "openness": 1.0,
            "conscientiousness": 1.0,
            "extraversion": 1.0,
            "agreeableness": 1.0,
            "neuroticism": 1.0
        }
        self.scaler = MinMaxScaler(feature_range=(0, 100))
    
    def analyze(self, questionnaire: Questionnaire) -> Dict:
        """分析问卷结果"""
        # 获取所有回答
        responses = questionnaire.responses
        
        # 按类别分组分析
        personality_scores = self._analyze_personality(responses)
        role_preference = self._analyze_role_preference(responses)
        interaction_style = self._analyze_interaction_style(responses)
        
        # 计算置信度
        confidence_score = self._calculate_confidence(responses)
        
        return {
            "personality": personality_scores,
            "role_preference": role_preference,
            "interaction_style": interaction_style,
            "confidence_score": confidence_score,
            "timestamp": questionnaire.created_at.isoformat()
        }
    
    def _analyze_personality(self, responses: List[QuestionResponse]) -> Dict:
        """分析性格特征"""
        trait_scores = {
            "openness": [],
            "conscientiousness": [],
            "extraversion": [],
            "agreeableness": [],
            "neuroticism": []
        }
        
        # 收集每个特征的得分
        for response in responses:
            if response.question.category == "personality":
                traits = response.question.traits
                score = self._calculate_response_score(response)
                
                for trait, weight in traits.items():
                    if trait in trait_scores:
                        trait_scores[trait].append(score * weight)
        
        # 计算每个特征的平均分
        final_scores = {}
        for trait, scores in trait_scores.items():
            if scores:
                avg_score = np.mean(scores) * self.trait_weights[trait]
                final_scores[trait] = min(100, max(0, avg_score))
            else:
                final_scores[trait] = 50  # 默认中间值
        
        return final_scores
    
    def _analyze_role_preference(self, responses: List[QuestionResponse]) -> Dict:
        """分析角色偏好"""
        role_scores = {}
        
        for response in responses:
            if response.question.category == "role_preference":
                score = self._calculate_response_score(response)
                role_type = response.question.traits.get("role_type")
                
                if role_type:
                    if role_type not in role_scores:
                        role_scores[role_type] = []
                    role_scores[role_type].append(score)
        
        # 计算每个角色类型的平均分
        final_scores = {}
        for role_type, scores in role_scores.items():
            if scores:
                final_scores[role_type] = min(100, max(0, np.mean(scores)))
        
        return final_scores
    
    def _analyze_interaction_style(self, responses: List[QuestionResponse]) -> Dict:
        """分析互动风格"""
        style_scores = {
            "leadership": [],
            "cooperation": [],
            "communication": [],
            "problem_solving": []
        }
        
        for response in responses:
            if response.question.category == "interaction_style":
                score = self._calculate_response_score(response)
                styles = response.question.traits
                
                for style, weight in styles.items():
                    if style in style_scores:
                        style_scores[style].append(score * weight)
        
        # 计算每个互动风格的得分
        final_scores = {}
        for style, scores in style_scores.items():
            if scores:
                final_scores[style] = min(100, max(0, np.mean(scores)))
            else:
                final_scores[style] = 50  # 默认中间值
        
        return final_scores
    
    def _calculate_response_score(self, response: QuestionResponse) -> float:
        """计算单个回答的得分"""
        question = response.question
        value = response.response_value
        
        if question.question_type == "scale":
            # 量表题直接返回分数
            return float(value)
        
        elif question.question_type == "multiple_choice":
            # 选择题根据选项权重计算
            options = question.options
            selected_option = options[int(value)]
            return float(selected_option.get("weight", 1.0))
        
        elif question.question_type == "text":
            # 文本题需要进行情感分析
            return self._analyze_text_response(value)
        
        return 0.0
    
    def _analyze_text_response(self, text: str) -> float:
        """分析文本回答（简单实现）"""
        # TODO: 实现更复杂的文本分析
        # 这里可以使用NLP模型进行情感分析
        return 50.0  # 暂时返回中性分数
    
    def _calculate_confidence(self, responses: List[QuestionResponse]) -> float:
        """计算分析结果的置信度"""
        if not responses:
            return 0.0
        
        # 基于回答的完整性和一致性计算置信度
        required_questions = len(responses)
        answered_questions = sum(1 for r in responses if r.response_value is not None)
        completion_rate = answered_questions / required_questions
        
        # 计算回答的一致性（可以基于相似问题的回答）
        consistency_score = 0.8  # TODO: 实现一致性检查
        
        # 综合评分
        confidence = (completion_rate * 0.6 + consistency_score * 0.4) * 100
        return min(100, max(0, confidence)) 