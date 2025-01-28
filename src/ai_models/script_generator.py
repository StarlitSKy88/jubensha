import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
import numpy as np
from typing import Dict, List, Optional
import json
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class ScriptGenerator:
    def __init__(
        self,
        model_path: str,
        max_tokens: int = 2048,
        temperature: float = 0.7,
        device: str = "cuda" if torch.cuda.is_available() else "cpu"
    ):
        self.tokenizer = AutoTokenizer.from_pretrained(model_path)
        self.model = AutoModelForCausalLM.from_pretrained(
            model_path,
            torch_dtype=torch.float16 if device == "cuda" else torch.float32
        ).to(device)
        
        self.max_tokens = max_tokens
        self.temperature = temperature
        self.device = device
        
        logger.info(f"ScriptGenerator initialized on device: {device}")

    async def generate_full_script(
        self,
        core_plot: dict,
        roles: List[dict],
        clues: List[dict],
        relations: Dict[str, List[str]],
        player_count: int,
        difficulty: int
    ) -> dict:
        """生成完整剧本"""
        try:
            # 构建提示
            prompt = self._build_script_prompt(
                core_plot=core_plot,
                roles=roles,
                clues=clues,
                relations=relations,
                player_count=player_count,
                difficulty=difficulty
            )
            
            # 生成剧本内容
            generated_text = await self._generate_text(prompt)
            
            # 解析生成的内容
            script_content = self._parse_script_content(generated_text)
            
            return {
                "content": script_content,
                "metadata": {
                    "generated_at": datetime.utcnow().isoformat(),
                    "model_version": self.model.config.name_or_path,
                    "parameters": {
                        "temperature": self.temperature,
                        "max_tokens": self.max_tokens
                    }
                }
            }
        
        except Exception as e:
            logger.error(f"生成剧本失败: {str(e)}")
            raise

    async def adapt_roles(
        self,
        base_roles: List[dict],
        target_count: int
    ) -> List[dict]:
        """调整角色数量"""
        try:
            if target_count < len(base_roles):
                # 合并角色
                prompt = self._build_role_merge_prompt(
                    base_roles=base_roles,
                    target_count=target_count
                )
            else:
                # 扩展角色
                prompt = self._build_role_expand_prompt(
                    base_roles=base_roles,
                    target_count=target_count
                )
            
            generated_text = await self._generate_text(prompt)
            adapted_roles = self._parse_roles(generated_text)
            
            return adapted_roles
        
        except Exception as e:
            logger.error(f"调整角色失败: {str(e)}")
            raise

    async def adapt_clues(
        self,
        base_clues: List[dict],
        player_count: int,
        difficulty: int
    ) -> List[dict]:
        """调整线索分布"""
        try:
            prompt = self._build_clue_adapt_prompt(
                base_clues=base_clues,
                player_count=player_count,
                difficulty=difficulty
            )
            
            generated_text = await self._generate_text(prompt)
            adapted_clues = self._parse_clues(generated_text)
            
            return adapted_clues
        
        except Exception as e:
            logger.error(f"调整线索失败: {str(e)}")
            raise

    async def adapt_relations(
        self,
        base_relations: Dict[str, List[str]],
        roles: List[dict]
    ) -> Dict[str, List[str]]:
        """调整角色关系"""
        try:
            prompt = self._build_relation_adapt_prompt(
                base_relations=base_relations,
                roles=roles
            )
            
            generated_text = await self._generate_text(prompt)
            adapted_relations = self._parse_relations(generated_text)
            
            return adapted_relations
        
        except Exception as e:
            logger.error(f"调整关系失败: {str(e)}")
            raise

    def _build_script_prompt(
        self,
        core_plot: dict,
        roles: List[dict],
        clues: List[dict],
        relations: Dict[str, List[str]],
        player_count: int,
        difficulty: int
    ) -> str:
        """构建剧本生成提示"""
        prompt = f"""请根据以下信息生成一个完整的剧本：

核心剧情：
{json.dumps(core_plot, ensure_ascii=False, indent=2)}

角色设定：
{json.dumps(roles, ensure_ascii=False, indent=2)}

线索分布：
{json.dumps(clues, ensure_ascii=False, indent=2)}

角色关系：
{json.dumps(relations, ensure_ascii=False, indent=2)}

玩家人数：{player_count}
难度等级：{difficulty}

要求：
1. 保持剧情的连贯性和合理性
2. 确保每个角色都有明确的动机和目标
3. 线索分布要符合难度要求
4. 角色关系要自然且有张力
5. 结局要有多种可能性

请生成包含以下部分的剧本：
1. 背景介绍
2. 角色详细信息
3. 事件时间线
4. 关键场景描述
5. 线索分布说明
6. 可能的结局分支"""
        
        return prompt

    def _build_role_merge_prompt(
        self,
        base_roles: List[dict],
        target_count: int
    ) -> str:
        """构建角色合并提示"""
        prompt = f"""请将以下{len(base_roles)}个角色合并为{target_count}个角色：

原始角色：
{json.dumps(base_roles, ensure_ascii=False, indent=2)}

要求：
1. 保持故事的完整性
2. 合理合并角色特征和动机
3. 确保关键信息不会丢失
4. 新角色之间要有足够的差异性"""
        
        return prompt

    def _build_role_expand_prompt(
        self,
        base_roles: List[dict],
        target_count: int
    ) -> str:
        """构建角色扩展提示"""
        prompt = f"""请基于以下{len(base_roles)}个角色扩展为{target_count}个角色：

原始角色：
{json.dumps(base_roles, ensure_ascii=False, indent=2)}

要求：
1. 新角色要与原有角色形成合理的关联
2. 保持角色的平衡性
3. 新增角色要有独特的特征和动机
4. 避免角色之间的重复"""
        
        return prompt

    def _build_clue_adapt_prompt(
        self,
        base_clues: List[dict],
        player_count: int,
        difficulty: int
    ) -> str:
        """构建线索调整提示"""
        prompt = f"""请调整以下线索的分布，适应{player_count}名玩家，难度等级{difficulty}：

原始线索：
{json.dumps(base_clues, ensure_ascii=False, indent=2)}

要求：
1. 线索数量要适合玩家人数
2. 难度要符合指定等级
3. 确保线索之间的关联性
4. 合理分配关键线索和次要线索"""
        
        return prompt

    def _build_relation_adapt_prompt(
        self,
        base_relations: Dict[str, List[str]],
        roles: List[dict]
    ) -> str:
        """构建关系调整提示"""
        prompt = f"""请根据新的角色设定调整角色关系：

原始关系：
{json.dumps(base_relations, ensure_ascii=False, indent=2)}

新角色设定：
{json.dumps(roles, ensure_ascii=False, indent=2)}

要求：
1. 保持关系网络的合理性
2. 确保每个角色都有足够的关联
3. 创造有趣的关系冲突
4. 避免关系过于简单或复杂"""
        
        return prompt

    async def _generate_text(self, prompt: str) -> str:
        """生成文本"""
        try:
            inputs = self.tokenizer(
                prompt,
                return_tensors="pt",
                max_length=self.max_tokens,
                truncation=True
            ).to(self.device)
            
            outputs = self.model.generate(
                **inputs,
                max_length=self.max_tokens,
                num_return_sequences=1,
                temperature=self.temperature,
                do_sample=True,
                pad_token_id=self.tokenizer.eos_token_id
            )
            
            generated_text = self.tokenizer.decode(
                outputs[0],
                skip_special_tokens=True
            )
            
            # 移除原始提示
            response = generated_text[len(prompt):]
            
            return response.strip()
        
        except Exception as e:
            logger.error(f"文本生成失败: {str(e)}")
            raise

    def _parse_script_content(self, text: str) -> dict:
        """解析生成的剧本内容"""
        try:
            # 这里需要实现更复杂的解析逻辑
            sections = text.split("\n\n")
            
            content = {
                "background": sections[0] if len(sections) > 0 else "",
                "characters": self._parse_characters(sections[1]) if len(sections) > 1 else [],
                "timeline": self._parse_timeline(sections[2]) if len(sections) > 2 else [],
                "scenes": self._parse_scenes(sections[3]) if len(sections) > 3 else [],
                "clues": self._parse_clues(sections[4]) if len(sections) > 4 else [],
                "endings": self._parse_endings(sections[5]) if len(sections) > 5 else []
            }
            
            return content
        
        except Exception as e:
            logger.error(f"解析剧本内容失败: {str(e)}")
            raise

    def _parse_characters(self, text: str) -> List[dict]:
        """解析角色信息"""
        # 实现角色信息解析逻辑
        pass

    def _parse_timeline(self, text: str) -> List[dict]:
        """解析时间线"""
        # 实现时间线解析逻辑
        pass

    def _parse_scenes(self, text: str) -> List[dict]:
        """解析场景"""
        # 实现场景解析逻辑
        pass

    def _parse_clues(self, text: str) -> List[dict]:
        """解析线索"""
        # 实现线索解析逻辑
        pass

    def _parse_endings(self, text: str) -> List[dict]:
        """解析结局"""
        # 实现结局解析逻辑
        pass

    def _parse_roles(self, text: str) -> List[dict]:
        """解析角色"""
        # 实现角色解析逻辑
        pass

    def _parse_relations(self, text: str) -> Dict[str, List[str]]:
        """解析关系"""
        # 实现关系解析逻辑
        pass 