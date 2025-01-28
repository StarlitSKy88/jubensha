import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import numpy as np
from typing import List, Dict, Optional
import json
import logging
from datetime import datetime
from sklearn.metrics.pairwise import cosine_similarity

logger = logging.getLogger(__name__)

class RoleAssigner:
    """
    AI model for assigning appropriate roles based on user input and context
    """
    
    def __init__(
        self,
        model_path: str,
        device: str = "cuda" if torch.cuda.is_available() else "cpu"
    ):
        self.tokenizer = AutoTokenizer.from_pretrained(model_path)
        self.model = AutoModelForSequenceClassification.from_pretrained(
            model_path,
            torch_dtype=torch.float16 if device == "cuda" else torch.float32
        ).to(device)
        
        self.device = device
        logger.info(f"RoleAssigner initialized on device: {device}")

    async def assign_roles(
        self,
        roles: List[dict],
        player_profiles: List[dict]
    ) -> Dict[str, str]:
        """为玩家分配角色"""
        try:
            # 提取角色特征
            role_features = await self._extract_role_features(roles)
            
            # 提取玩家特征
            player_features = await self._extract_player_features(player_profiles)
            
            # 计算匹配度
            matches = await self._compute_matches(
                role_features=role_features,
                player_features=player_features,
                roles=roles,
                player_profiles=player_profiles
            )
            
            # 优化分配
            assignments = await self._optimize_assignments(
                matches=matches,
                roles=roles,
                player_profiles=player_profiles
            )
            
            return {
                "assignments": assignments,
                "metadata": {
                    "assigned_at": datetime.utcnow().isoformat(),
                    "model_version": self.model.config.name_or_path
                }
            }
        
        except Exception as e:
            logger.error(f"角色分配失败: {str(e)}")
            raise

    async def _extract_role_features(
        self,
        roles: List[dict]
    ) -> np.ndarray:
        """提取角色特征"""
        try:
            role_texts = [
                self._build_role_text(role) for role in roles
            ]
            
            # 编码角色文本
            inputs = self.tokenizer(
                role_texts,
                padding=True,
                truncation=True,
                return_tensors="pt"
            ).to(self.device)
            
            with torch.no_grad():
                outputs = self.model(**inputs)
                features = outputs.logits.cpu().numpy()
            
            return features
        
        except Exception as e:
            logger.error(f"提取角色特征失败: {str(e)}")
            raise

    async def _extract_player_features(
        self,
        player_profiles: List[dict]
    ) -> np.ndarray:
        """提取玩家特征"""
        try:
            profile_texts = [
                self._build_profile_text(profile) for profile in player_profiles
            ]
            
            # 编码玩家资料
            inputs = self.tokenizer(
                profile_texts,
                padding=True,
                truncation=True,
                return_tensors="pt"
            ).to(self.device)
            
            with torch.no_grad():
                outputs = self.model(**inputs)
                features = outputs.logits.cpu().numpy()
            
            return features
        
        except Exception as e:
            logger.error(f"提取玩家特征失败: {str(e)}")
            raise

    async def _compute_matches(
        self,
        role_features: np.ndarray,
        player_features: np.ndarray,
        roles: List[dict],
        player_profiles: List[dict]
    ) -> np.ndarray:
        """计算角色和玩家的匹配度"""
        try:
            # 计算余弦相似度
            similarity_matrix = cosine_similarity(player_features, role_features)
            
            # 应用角色约束
            for i, profile in enumerate(player_profiles):
                for j, role in enumerate(roles):
                    if not self._check_role_constraints(role, profile):
                        similarity_matrix[i, j] = -np.inf
            
            return similarity_matrix
        
        except Exception as e:
            logger.error(f"计算匹配度失败: {str(e)}")
            raise

    async def _optimize_assignments(
        self,
        matches: np.ndarray,
        roles: List[dict],
        player_profiles: List[dict]
    ) -> Dict[str, str]:
        """优化角色分配"""
        try:
            from scipy.optimize import linear_sum_assignment
            
            # 使用匈牙利算法进行最优分配
            player_indices, role_indices = linear_sum_assignment(
                -matches  # 转换为最大化问题
            )
            
            # 构建分配结果
            assignments = {}
            for p_idx, r_idx in zip(player_indices, role_indices):
                player_id = player_profiles[p_idx]["user_id"]
                role_id = roles[r_idx]["id"]
                assignments[player_id] = role_id
            
            return assignments
        
        except Exception as e:
            logger.error(f"优化分配失败: {str(e)}")
            raise

    def _build_role_text(self, role: dict) -> str:
        """构建角色描述文本"""
        text = f"""角色名称：{role.get('name', '')}
性格特征：{role.get('personality', '')}
背景故事：{role.get('background', '')}
动机目标：{role.get('motivation', '')}
技能特长：{role.get('skills', '')}"""
        return text

    def _build_profile_text(self, profile: dict) -> str:
        """构建玩家画像文本"""
        text = f"""游戏偏好：{json.dumps(profile.get('preferences', {}), ensure_ascii=False)}
性格特征：{json.dumps(profile.get('personality_traits', {}), ensure_ascii=False)}
技能水平：{json.dumps(profile.get('skill_levels', {}), ensure_ascii=False)}
游戏历史：{json.dumps(profile.get('play_history', []), ensure_ascii=False)}"""
        return text

    def _check_role_constraints(
        self,
        role: dict,
        profile: dict
    ) -> bool:
        """检查角色约束"""
        try:
            # 检查难度要求
            if role.get("difficulty", 0) > profile.get("skill_levels", {}).get("general", 0):
                return False
            
            # 检查角色类型偏好
            if role.get("type") not in profile.get("preferences", {}).get("role_types", []):
                return False
            
            # 检查性格匹配
            role_personality = set(role.get("personality_tags", []))
            player_personality = set(profile.get("personality_traits", {}).keys())
            if not role_personality.intersection(player_personality):
                return False
            
            return True
        
        except Exception as e:
            logger.error(f"检查角色约束失败: {str(e)}")
            return False