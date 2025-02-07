from typing import List, Dict, Any, Optional
from datetime import datetime
from langchain.memory import ConversationBufferMemory
from langchain.chat_models import ChatOpenAI
from langchain.chains import ConversationChain
from langchain.prompts import PromptTemplate
import json

class ChatManager:
    def __init__(self, 
                 model_name: str = "gpt-3.5-turbo",
                 memory_size: int = 5,
                 temperature: float = 0.7):
        """初始化对话管理器
        
        Args:
            model_name: 使用的模型名称
            memory_size: 记忆的对话轮数
            temperature: 温度参数
        """
        self.model_name = model_name
        self.memory_size = memory_size
        self.temperature = temperature
        self.memory = ConversationBufferMemory(k=memory_size)
        self.chat_model = ChatOpenAI(
            model_name=model_name,
            temperature=temperature
        )
        self.conversation = None
        self._init_conversation()
    
    def _init_conversation(self):
        """初始化对话链"""
        prompt_template = """当前对话历史:
{history}
人类: {input}
AI助手: 让我思考一下。"""
        
        prompt = PromptTemplate(
            input_variables=["history", "input"],
            template=prompt_template
        )
        
        self.conversation = ConversationChain(
            llm=self.chat_model,
            memory=self.memory,
            prompt=prompt,
            verbose=True
        )
    
    def chat(self, message: str) -> str:
        """进行对话
        
        Args:
            message: 用户输入的消息
            
        Returns:
            AI的回复
        """
        if not self.conversation:
            self._init_conversation()
        
        try:
            response = self.conversation.predict(input=message)
            return response
        except Exception as e:
            raise RuntimeError(f"对话生成失败: {str(e)}")
    
    def get_history(self) -> List[Dict[str, Any]]:
        """获取对话历史
        
        Returns:
            对话历史列表
        """
        return self.memory.chat_memory.messages
    
    def clear_history(self):
        """清空对话历史"""
        self.memory.clear()
        self._init_conversation()
    
    def save_history(self, path: str):
        """保存对话历史
        
        Args:
            path: 保存路径
        """
        history = {
            "timestamp": datetime.now().isoformat(),
            "model": self.model_name,
            "messages": self.get_history()
        }
        with open(path, "w", encoding="utf-8") as f:
            json.dump(history, f, ensure_ascii=False, indent=2)
    
    def load_history(self, path: str):
        """加载对话历史
        
        Args:
            path: 加载路径
        """
        with open(path, "r", encoding="utf-8") as f:
            history = json.load(f)
        self.clear_history()
        for message in history["messages"]:
            if message["type"] == "human":
                self.chat(message["content"])
            
    def update_context(self, context: str):
        """更新对话上下文
        
        Args:
            context: 新的上下文信息
        """
        prompt_template = f"""上下文信息：{context}

当前对话历史:
{{history}}
人类: {{input}}
AI助手: 让我思考一下。"""
        
        prompt = PromptTemplate(
            input_variables=["history", "input"],
            template=prompt_template
        )
        
        self.conversation.prompt = prompt 