import pytest
from typing import Dict, Any
from langchain.chains import LLMChain
from langchain_core.output_parsers import BaseOutputParser
from src.langchain.core.llm_manager import LLMManager

class SimpleOutputParser(BaseOutputParser):
    """简单的输出解析器"""
    def parse(self, text: str) -> Dict[str, Any]:
        return {"text": text}

@pytest.fixture
def llm_manager():
    """创建测试用的LLM管理器"""
    return LLMManager(
        model_name="gpt-3.5-turbo",
        temperature=0.5,
        max_tokens=1000,
        memory_size=3
    )

@pytest.fixture
def test_prompt():
    """创建测试用的提示"""
    return "请为一个悬疑剧本创作开场白。"

@pytest.mark.asyncio
async def test_generate(llm_manager, test_prompt):
    """测试生成功能"""
    response = await llm_manager.generate(test_prompt)
    assert isinstance(response, str)
    assert len(response) > 0

def test_create_chain(llm_manager):
    """测试创建自定义对话链"""
    prompt_template = """你是一个专业的剧本分析师。
请分析以下剧本片段的优缺点。

当前对话历史:
{history}

用户输入: {input}

分析结果:"""
    
    output_parser = SimpleOutputParser()
    chain = llm_manager.create_chain(prompt_template, output_parser)
    
    assert isinstance(chain, LLMChain)
    assert chain.prompt.template == prompt_template
    assert chain.output_parser == output_parser

def test_update_context(llm_manager):
    """测试更新上下文"""
    context = "这是一个青春悬疑题材的剧本。"
    llm_manager.update_context(context)
    assert context in llm_manager.chain.prompt.template

def test_memory_management(llm_manager, test_prompt):
    """测试记忆管理功能"""
    # 清空记忆
    llm_manager.clear_memory()
    assert len(llm_manager.get_memory()) == 0
    
    # 生成一些对话
    async def generate_conversations():
        for i in range(5):
            await llm_manager.generate(f"{test_prompt} {i}")
    
    import asyncio
    asyncio.run(generate_conversations())
    
    # 验证记忆大小限制
    memory = llm_manager.get_memory()
    assert len(memory) <= llm_manager.memory_size * 2  # 考虑到每轮对话包含问题和回答

def test_get_model_info(llm_manager):
    """测试获取模型信息"""
    info = llm_manager.get_model_info()
    assert info["model_name"] == "gpt-3.5-turbo"
    assert info["temperature"] == 0.5
    assert info["max_tokens"] == 1000
    assert info["memory_size"] == 3

@pytest.mark.asyncio
async def test_error_handling(llm_manager):
    """测试错误处理"""
    # 测试无效的chain
    with pytest.raises(Exception):
        await llm_manager.generate("test", chain=None)
    
    # 测试过长的输入
    long_prompt = "test" * 1000
    with pytest.raises(Exception):
        await llm_manager.generate(long_prompt)

def test_custom_chain_creation(llm_manager):
    """测试自定义chain创建的不同场景"""
    # 测试基本chain
    chain1 = llm_manager.create_chain("Basic template {history} {input}")
    assert chain1.prompt.template == "Basic template {history} {input}"
    
    # 测试带解析器的chain
    parser = SimpleOutputParser()
    chain2 = llm_manager.create_chain(
        "Template with parser {history} {input}",
        output_parser=parser
    )
    assert chain2.output_parser == parser
    
    # 测试复杂模板
    complex_template = """
    系统: 你是一个专业的剧本顾问
    历史: {history}
    用户: {input}
    顾问: 让我分析一下这个问题。
    """
    chain3 = llm_manager.create_chain(complex_template)
    assert complex_template in chain3.prompt.template 