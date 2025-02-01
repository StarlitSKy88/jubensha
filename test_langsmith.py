import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langsmith import Client

# 加载环境变量
load_dotenv()

# 初始化 LangSmith 客户端
client = Client(
    api_key=os.getenv("LANGSMITH_API_KEY"),
    api_url=os.getenv("LANGSMITH_ENDPOINT")
)

# 初始化 ChatOpenAI（使用 DeepSeek 的 API）
llm = ChatOpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    base_url=os.getenv("OPENAI_API_BASE"),
    model="deepseek-chat",  # 使用 DeepSeek 的模型
    temperature=0.7,
    max_tokens=1000
)

# 发送测试消息
response = llm.invoke("你好，请介绍一下你自己。")
print(f"Response: {response}")

# 获取最近的运行记录
runs = client.list_runs(
    project_name=os.getenv("LANGSMITH_PROJECT"),
    execution_order=1,
    limit=5
)

print("\nRecent runs:")
for run in runs:
    print(f"- {run.id}: {run.name} ({run.run_type})") 