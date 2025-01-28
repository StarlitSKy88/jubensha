import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import numpy as np
from typing import List, Dict, Optional
import json
import logging
from datetime import datetime
from sklearn.preprocessing import MinMaxScaler

logger = logging.getLogger(__name__)

class EmotionAnalyzer:
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
        self.scaler = MinMaxScaler()
        
        # 情感标签
        self.emotion_labels = [
            "joy", "sadness", "anger", "fear",
            "surprise", "disgust", "neutral"
        ]
        
        logger.info(f"EmotionAnalyzer initialized on device: {device}")

    async def analyze_text(
        self,
        text: str,
        context: Optional[Dict] = None
    ) -> Dict:
        """分析文本情感"""
        try:
            # 编码文本
            inputs = self.tokenizer(
                text,
                return_tensors="pt",
                truncation=True,
                max_length=512
            ).to(self.device)
            
            # 预测情感
            with torch.no_grad():
                outputs = self.model(**inputs)
                scores = torch.softmax(outputs.logits, dim=1)
                scores = scores.cpu().numpy()[0]
            
            # 标准化分数
            normalized_scores = self.scaler.fit_transform(
                scores.reshape(-1, 1)
            ).reshape(-1)
            
            # 构建结果
            emotions = {
                label: float(score)
                for label, score in zip(self.emotion_labels, normalized_scores)
            }
            
            # 获取主要情感
            dominant_emotion = max(emotions.items(), key=lambda x: x[1])
            
            return {
                "emotions": emotions,
                "dominant_emotion": {
                    "label": dominant_emotion[0],
                    "score": dominant_emotion[1]
                },
                "metadata": {
                    "analyzed_at": datetime.utcnow().isoformat(),
                    "model_version": self.model.config.name_or_path,
                    "context": context
                }
            }
        
        except Exception as e:
            logger.error(f"文本情感分析失败: {str(e)}")
            raise

    async def analyze_conversation(
        self,
        messages: List[Dict],
        window_size: int = 5
    ) -> Dict:
        """分析对话情感"""
        try:
            # 按时间窗口分组
            windows = [
                messages[i:i + window_size]
                for i in range(0, len(messages), window_size)
            ]
            
            # 分析每个窗口
            window_analyses = []
            for window in windows:
                # 合并窗口内的消息
                window_text = " ".join(
                    msg["content"] for msg in window
                )
                
                # 分析窗口情感
                analysis = await self.analyze_text(
                    text=window_text,
                    context={
                        "window_start": window[0]["timestamp"],
                        "window_end": window[-1]["timestamp"],
                        "message_count": len(window)
                    }
                )
                
                window_analyses.append(analysis)
            
            # 计算情感变化
            emotion_trends = self._compute_emotion_trends(window_analyses)
            
            return {
                "window_analyses": window_analyses,
                "emotion_trends": emotion_trends,
                "metadata": {
                    "analyzed_at": datetime.utcnow().isoformat(),
                    "window_size": window_size,
                    "total_messages": len(messages)
                }
            }
        
        except Exception as e:
            logger.error(f"对话情感分析失败: {str(e)}")
            raise

    async def analyze_player_emotions(
        self,
        player_id: str,
        messages: List[Dict],
        time_range: Optional[Dict] = None
    ) -> Dict:
        """分析玩家情感状态"""
        try:
            # 筛选玩家消息
            player_messages = [
                msg for msg in messages
                if msg["user_id"] == player_id
            ]
            
            if time_range:
                # 按时间范围筛选
                start_time = datetime.fromisoformat(time_range["start"])
                end_time = datetime.fromisoformat(time_range["end"])
                
                player_messages = [
                    msg for msg in player_messages
                    if start_time <= datetime.fromisoformat(msg["timestamp"]) <= end_time
                ]
            
            # 分析消息
            message_analyses = []
            for message in player_messages:
                analysis = await self.analyze_text(
                    text=message["content"],
                    context={
                        "timestamp": message["timestamp"],
                        "message_type": message.get("type", "text")
                    }
                )
                message_analyses.append(analysis)
            
            # 计算情感统计
            emotion_stats = self._compute_emotion_statistics(message_analyses)
            
            # 检测情感异常
            emotion_anomalies = self._detect_emotion_anomalies(
                message_analyses,
                emotion_stats
            )
            
            return {
                "player_id": player_id,
                "message_analyses": message_analyses,
                "emotion_statistics": emotion_stats,
                "emotion_anomalies": emotion_anomalies,
                "metadata": {
                    "analyzed_at": datetime.utcnow().isoformat(),
                    "message_count": len(player_messages),
                    "time_range": time_range
                }
            }
        
        except Exception as e:
            logger.error(f"玩家情感分析失败: {str(e)}")
            raise

    def _compute_emotion_trends(
        self,
        analyses: List[Dict]
    ) -> Dict:
        """计算情感变化趋势"""
        try:
            # 提取每种情感的分数序列
            emotion_sequences = {
                emotion: [
                    analysis["emotions"][emotion]
                    for analysis in analyses
                ]
                for emotion in self.emotion_labels
            }
            
            # 计算趋势
            trends = {}
            for emotion, sequence in emotion_sequences.items():
                if len(sequence) < 2:
                    continue
                
                # 计算变化率
                changes = np.diff(sequence)
                avg_change = float(np.mean(changes))
                std_change = float(np.std(changes))
                
                # 判断趋势
                if avg_change > std_change:
                    trend = "increasing"
                elif avg_change < -std_change:
                    trend = "decreasing"
                else:
                    trend = "stable"
                
                trends[emotion] = {
                    "trend": trend,
                    "average_change": avg_change,
                    "volatility": std_change
                }
            
            return trends
        
        except Exception as e:
            logger.error(f"计算情感趋势失败: {str(e)}")
            raise

    def _compute_emotion_statistics(
        self,
        analyses: List[Dict]
    ) -> Dict:
        """计算情感统计信息"""
        try:
            # 提取情感分数
            emotion_scores = {
                emotion: [
                    analysis["emotions"][emotion]
                    for analysis in analyses
                ]
                for emotion in self.emotion_labels
            }
            
            # 计算统计量
            stats = {}
            for emotion, scores in emotion_scores.items():
                if not scores:
                    continue
                
                stats[emotion] = {
                    "mean": float(np.mean(scores)),
                    "std": float(np.std(scores)),
                    "min": float(np.min(scores)),
                    "max": float(np.max(scores)),
                    "median": float(np.median(scores))
                }
            
            return stats
        
        except Exception as e:
            logger.error(f"计算情感统计失败: {str(e)}")
            raise

    def _detect_emotion_anomalies(
        self,
        analyses: List[Dict],
        stats: Dict
    ) -> List[Dict]:
        """检测情感异常"""
        try:
            anomalies = []
            
            for i, analysis in enumerate(analyses):
                # 检查每种情感是否异常
                for emotion in self.emotion_labels:
                    score = analysis["emotions"][emotion]
                    emotion_stats = stats.get(emotion, {})
                    
                    if not emotion_stats:
                        continue
                    
                    mean = emotion_stats["mean"]
                    std = emotion_stats["std"]
                    
                    # 使用3倍标准差作为阈值
                    if abs(score - mean) > 3 * std:
                        anomalies.append({
                            "index": i,
                            "timestamp": analysis["metadata"]["context"]["timestamp"],
                            "emotion": emotion,
                            "score": score,
                            "deviation": abs(score - mean) / std
                        })
            
            return anomalies
        
        except Exception as e:
            logger.error(f"检测情感异常失败: {str(e)}")
            raise