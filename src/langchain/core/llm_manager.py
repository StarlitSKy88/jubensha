from typing import Dict, List, Any, Optional
from langchain_core.language_models import BaseLLM
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import BaseOutputParser
from langchain.chat_models import ChatOpenAI
from langchain.chains import LLMChain
from langchain.memory import ConversationBufferMemory
from src.utils.logger import default_logger

class LLMManager:
    def __init__(self,
                 model_name: str = "gpt-3.5-turbo",
                 temperature: float = 0.7,
                 max_tokens: int = 2000,
                 memory_size: int = 5):
        """初始化LLM管理器
        
        Args:
            model_name: 模型名称
            temperature: 温度参数
            max_tokens: 最大token数
            memory_size: 记忆的对话轮数
        """
        self.model_name = model_name
        self.temperature = temperature
        self.max_tokens = max_tokens
        self.memory_size = memory_size
        
        self.llm = ChatOpenAI(
            model_name=model_name,
            temperature=temperature,
            max_tokens=max_tokens
        )
        
        self.memory = ConversationBufferMemory(k=memory_size)
        self._init_default_chain()
    
    def _init_default_chain(self):
        """初始化默认对话链"""
        prompt_template = """你是一个专业的剧本创作助手。
基于当前对话历史和用户输入，请提供专业、有创意的建议。

当前对话历史:
{history}

用户输入: {input}

助手: 让我思考一下。"""
        
        prompt = PromptTemplate(
            input_variables=["history", "input"],
            template=prompt_template
        )
        
        self.chain = LLMChain(
            llm=self.llm,
            prompt=prompt,
            memory=self.memory,
            verbose=True
        )
    
    def create_chain(self,
                    prompt_template: str,
                    output_parser: Optional[BaseOutputParser] = None) -> LLMChain:
        """创建自定义对话链
        
        Args:
            prompt_template: 提示模板
            output_parser: 输出解析器
            
        Returns:
            对话链实例
        """
        prompt = PromptTemplate(
            input_variables=["history", "input"],
            template=prompt_template
        )
        
        return LLMChain(
            llm=self.llm,
            prompt=prompt,
            memory=self.memory,
            output_parser=output_parser,
            verbose=True
        )
    
    async def generate(self, 
                      prompt: str,
                      chain: Optional[LLMChain] = None,
                      **kwargs) -> str:
        """生成回复
        
        Args:
            prompt: 输入提示
            chain: 使用的对话链，默认使用内置chain
            **kwargs: 其他参数
            
        Returns:
            生成的回复
        """
        try:
            chain = chain or self.chain
            response = await chain.apredict(input=prompt, **kwargs)
            default_logger.info(f"Generated response for prompt: {prompt[:100]}...")
            return response
        except Exception as e:
            default_logger.error(f"Generation failed: {str(e)}")
            raise
    
    def update_context(self, context: str):
        """更新对话上下文
        
        Args:
            context: 新的上下文信息
        """
        prompt_template = f"""上下文信息：{context}

你是一个专业的剧本创作助手。
基于当前对话历史和用户输入，请提供专业、有创意的建议。

当前对话历史:
{{history}}

用户输入: {{input}}

助手: 让我思考一下。"""
        
        prompt = PromptTemplate(
            input_variables=["history", "input"],
            template=prompt_template
        )
        
        self.chain.prompt = prompt
    
    def clear_memory(self):
        """清空对话历史"""
        self.memory.clear()
    
    def get_memory(self) -> List[Dict[str, Any]]:
        """获取对话历史
        
        Returns:
            对话历史列表
        """
        return self.memory.chat_memory.messages
    
    def get_model_info(self) -> Dict[str, Any]:
        """获取模型信息
        
        Returns:
            模型信息字典
        """
        return {
            "model_name": self.model_name,
            "temperature": self.temperature,
            "max_tokens": self.max_tokens,
            "memory_size": self.memory_size
        }

# 创建默认LLM管理器
default_llm_manager = LLMManager() 