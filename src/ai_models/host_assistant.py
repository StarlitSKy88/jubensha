import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
import numpy as np
from typing import List, Dict, Optional
import json
import logging
from datetime import datetime
from .emotion_analyzer import EmotionAnalyzer

logger = logging.getLogger(__name__)

class HostAssistant:
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
        
        # 初始化情感分析器
        self.emotion_analyzer = EmotionAnalyzer(model_path)
        
        logger.info(f"HostAssistant initialized on device: {device}")

    async def generate_suggestions(
        self,
        game_state: Dict,
        current_time: datetime
    ) -> Dict:
        """生成主持建议"""
        try:
            # 分析当前状态
            state_analysis = await self._analyze_game_state(game_state)
            
            # 生成建议
            suggestions = await self._generate_host_suggestions(
                state_analysis=state_analysis,
                game_state=game_state,
                current_time=current_time
            )
            
            return {
                "suggestions": suggestions,
                "state_analysis": state_analysis,
                "metadata": {
                    "generated_at": datetime.utcnow().isoformat(),
                    "model_version": self.model.config.name_or_path
                }
            }
        
        except Exception as e:
            logger.error(f"生成主持建议失败: {str(e)}")
            raise

    async def analyze_player_interactions(
        self,
        messages: List[Dict],
        player_states: Dict[str, Dict]
    ) -> Dict:
        """分析玩家互动"""
        try:
            # 分析消息情感
            emotion_analysis = await self.emotion_analyzer.analyze_conversation(
                messages=messages
            )
            
            # 分析玩家状态
            player_analysis = await self._analyze_player_states(
                player_states=player_states,
                emotion_analysis=emotion_analysis
            )
            
            # 检测互动模式
            interaction_patterns = self._detect_interaction_patterns(
                messages=messages,
                player_analysis=player_analysis
            )
            
            return {
                "emotion_analysis": emotion_analysis,
                "player_analysis": player_analysis,
                "interaction_patterns": interaction_patterns,
                "metadata": {
                    "analyzed_at": datetime.utcnow().isoformat(),
                    "message_count": len(messages)
                }
            }
        
        except Exception as e:
            logger.error(f"分析玩家互动失败: {str(e)}")
            raise

    async def generate_intervention(
        self,
        situation: Dict,
        intervention_type: str
    ) -> Dict:
        """生成干预建议"""
        try:
            # 构建提示
            prompt = self._build_intervention_prompt(
                situation=situation,
                intervention_type=intervention_type
            )
            
            # 生成干预内容
            intervention_text = await self._generate_text(prompt)
            
            # 解析干预建议
            intervention = self._parse_intervention(intervention_text)
            
            return {
                "intervention": intervention,
                "metadata": {
                    "generated_at": datetime.utcnow().isoformat(),
                    "situation_type": situation.get("type"),
                    "intervention_type": intervention_type
                }
            }
        
        except Exception as e:
            logger.error(f"生成干预建议失败: {str(e)}")
            raise

    async def _analyze_game_state(
        self,
        game_state: Dict
    ) -> Dict:
        """分析游戏状态"""
        try:
            # 分析进度
            progress_analysis = self._analyze_progress(
                current_phase=game_state["current_phase"],
                revealed_clues=game_state["revealed_clues"],
                start_time=game_state["start_time"]
            )
            
            # 分析玩家状态
            player_analysis = await self._analyze_player_states(
                player_states=game_state["player_states"]
            )
            
            # 检测问题
            issues = self._detect_game_issues(
                progress_analysis=progress_analysis,
                player_analysis=player_analysis
            )
            
            return {
                "progress_analysis": progress_analysis,
                "player_analysis": player_analysis,
                "issues": issues
            }
        
        except Exception as e:
            logger.error(f"分析游戏状态失败: {str(e)}")
            raise

    def _analyze_progress(
        self,
        current_phase: Dict,
        revealed_clues: List[Dict],
        start_time: datetime
    ) -> Dict:
        """分析游戏进度"""
        try:
            # 计算时间进度
            elapsed_time = (datetime.utcnow() - start_time).total_seconds()
            time_progress = elapsed_time / current_phase["duration"]
            
            # 计算线索进度
            clue_progress = len(revealed_clues) / current_phase["total_clues"]
            
            # 判断进度状态
            if time_progress > clue_progress + 0.2:
                status = "behind_schedule"
            elif time_progress < clue_progress - 0.2:
                status = "ahead_schedule"
            else:
                status = "on_track"
            
            return {
                "time_progress": time_progress,
                "clue_progress": clue_progress,
                "status": status,
                "elapsed_time": elapsed_time
            }
        
        except Exception as e:
            logger.error(f"分析游戏进度失败: {str(e)}")
            raise

    async def _analyze_player_states(
        self,
        player_states: Dict[str, Dict],
        emotion_analysis: Optional[Dict] = None
    ) -> Dict:
        """分析玩家状态"""
        try:
            player_analyses = {}
            
            for player_id, state in player_states.items():
                # 基础状态分析
                analysis = {
                    "participation_level": self._analyze_participation(
                        state["message_count"],
                        state["last_message_time"]
                    ),
                    "progress_status": self._analyze_player_progress(
                        state["discovered_clues"],
                        state["completed_tasks"]
                    )
                }
                
                # 添加情感分析
                if emotion_analysis and player_id in emotion_analysis["player_emotions"]:
                    analysis["emotions"] = emotion_analysis["player_emotions"][player_id]
                
                player_analyses[player_id] = analysis
            
            return player_analyses
        
        except Exception as e:
            logger.error(f"分析玩家状态失败: {str(e)}")
            raise

    def _detect_game_issues(
        self,
        progress_analysis: Dict,
        player_analysis: Dict
    ) -> List[Dict]:
        """检测游戏问题"""
        try:
            issues = []
            
            # 检查进度问题
            if progress_analysis["status"] == "behind_schedule":
                issues.append({
                    "type": "progress",
                    "severity": "medium",
                    "description": "游戏进度落后",
                    "details": {
                        "time_progress": progress_analysis["time_progress"],
                        "clue_progress": progress_analysis["clue_progress"]
                    }
                })
            
            # 检查玩家问题
            for player_id, analysis in player_analysis.items():
                if analysis["participation_level"] == "low":
                    issues.append({
                        "type": "player",
                        "severity": "high",
                        "description": "玩家参与度低",
                        "player_id": player_id,
                        "details": analysis
                    })
            
            return issues
        
        except Exception as e:
            logger.error(f"检测游戏问题失败: {str(e)}")
            raise

    def _detect_interaction_patterns(
        self,
        messages: List[Dict],
        player_analysis: Dict
    ) -> List[Dict]:
        """检测互动模式"""
        try:
            patterns = []
            
            # 分析消息频率
            frequency_pattern = self._analyze_message_frequency(messages)
            if frequency_pattern:
                patterns.append(frequency_pattern)
            
            # 分析玩家互动
            interaction_pattern = self._analyze_player_interactions(
                messages,
                player_analysis
            )
            if interaction_pattern:
                patterns.append(interaction_pattern)
            
            return patterns
        
        except Exception as e:
            logger.error(f"检测互动模式失败: {str(e)}")
            raise

    async def _generate_host_suggestions(
        self,
        state_analysis: Dict,
        game_state: Dict,
        current_time: datetime
    ) -> List[Dict]:
        """生成主持建议"""
        try:
            suggestions = []
            
            # 处理进度问题
            if state_analysis["progress_analysis"]["status"] == "behind_schedule":
                suggestions.append(await self._generate_progress_suggestion(
                    state_analysis["progress_analysis"],
                    game_state
                ))
            
            # 处理玩家问题
            for player_id, analysis in state_analysis["player_analysis"].items():
                if analysis["participation_level"] == "low":
                    suggestions.append(await self._generate_player_suggestion(
                        player_id,
                        analysis,
                        game_state
                    ))
            
            # 生成常规建议
            suggestions.extend(await self._generate_regular_suggestions(
                game_state,
                current_time
            ))
            
            return suggestions
        
        except Exception as e:
            logger.error(f"生成主持建议失败: {str(e)}")
            raise

    def _build_intervention_prompt(
        self,
        situation: Dict,
        intervention_type: str
    ) -> str:
        """构建干预提示"""
        prompt = f"""基于以下情况生成{intervention_type}类型的干预建议：

情况描述：
{json.dumps(situation, ensure_ascii=False, indent=2)}

要求：
1. 建议要具体且可操作
2. 考虑对其他玩家的影响
3. 保持游戏的平衡性
4. 符合剧情发展

请生成包含以下内容的建议：
1. 干预措施
2. 预期效果
3. 可能的风险
4. 替代方案"""
        
        return prompt

    async def _generate_text(
        self,
        prompt: str
    ) -> str:
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
            
            return generated_text[len(prompt):].strip()
        
        except Exception as e:
            logger.error(f"生成文本失败: {str(e)}")
            raise

    def _parse_intervention(
        self,
        text: str
    ) -> Dict:
        """解析干预建议"""
        try:
            # 这里需要实现更复杂的解析逻辑
            sections = text.split("\n\n")
            
            intervention = {
                "measures": sections[0] if len(sections) > 0 else "",
                "expected_effects": sections[1] if len(sections) > 1 else "",
                "risks": sections[2] if len(sections) > 2 else "",
                "alternatives": sections[3] if len(sections) > 3 else ""
            }
            
            return intervention
        
        except Exception as e:
            logger.error(f"解析干预建议失败: {str(e)}")
            raise 