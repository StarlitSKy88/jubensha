# API使用指南

## 简介
本文档提供剧本杀创作平台API的使用说明，包括认证、知识库管理、AI服务和数据备份等功能的接口调用方法。

## 目录
1. [快速开始](#快速开始)
2. [认证](#认证)
3. [知识库管理](#知识库管理)
4. [AI服务](#ai服务)
5. [数据备份](#数据备份)
6. [最佳实践](#最佳实践)

## 快速开始

### 环境准备
1. 获取API密钥
   ```bash
   # 联系管理员获取以下信息
   CLIENT_ID=your_client_id
   CLIENT_SECRET=your_client_secret
   ```

2. 设置API地址
   ```bash
   # 开发环境
   API_URL=http://localhost:8000
   # 生产环境
   API_URL=https://api.scriptai.com
   ```

### 安装SDK
```bash
# Python SDK
pip install scriptai-client

# JavaScript SDK
npm install scriptai-js
```

### 示例代码
```python
from scriptai import ScriptAI

# 初始化客户端
client = ScriptAI(
    client_id="your_client_id",
    client_secret="your_client_secret",
    api_url="https://api.scriptai.com"
)

# 登录
token = client.auth.login(username="user@example.com", password="password")

# 添加文档
doc_id = client.knowledge.add_document(
    content="文档内容",
    metadata={"type": "script"}
)

# 搜索文档
results = client.knowledge.search(
    query="查询内容",
    limit=5
)
```

## 认证

### 获取访问令牌
```python
# 使用用户名密码登录
response = requests.post(
    f"{API_URL}/api/v1/auth/login",
    data={
        "username": "user@example.com",
        "password": "password"
    }
)
token = response.json()["access_token"]

# 在后续请求中使用令牌
headers = {
    "Authorization": f"Bearer {token}"
}
```

### 刷新令牌
```python
response = requests.post(
    f"{API_URL}/api/v1/auth/refresh",
    headers={
        "Authorization": f"Bearer {refresh_token}"
    }
)
new_token = response.json()["access_token"]
```

### 获取当前用户信息
```python
response = requests.get(
    f"{API_URL}/api/v1/auth/me",
    headers={
        "Authorization": f"Bearer {token}"
    }
)
user_info = response.json()
```

## 知识库管理

### 添加文档
```python
# 添加单个文档
response = requests.post(
    f"{API_URL}/api/v1/knowledge/documents",
    headers={
        "Authorization": f"Bearer {token}"
    },
    json={
        "content": "文档内容",
        "metadata": {
            "type": "script",
            "author": "user"
        }
    }
)
doc_id = response.json()["id"]

# 批量添加文档
response = requests.post(
    f"{API_URL}/api/v1/knowledge/documents/batch",
    headers={
        "Authorization": f"Bearer {token}"
    },
    json={
        "documents": [
            {
                "content": "文档1",
                "metadata": {"type": "script"}
            },
            {
                "content": "文档2",
                "metadata": {"type": "character"}
            }
        ]
    }
)
```

### 搜索文档
```python
# 基本搜索
response = requests.get(
    f"{API_URL}/api/v1/knowledge/search",
    headers={
        "Authorization": f"Bearer {token}"
    },
    params={
        "query": "搜索内容",
        "limit": 5
    }
)
results = response.json()

# 按类型搜索
response = requests.get(
    f"{API_URL}/api/v1/knowledge/search",
    headers={
        "Authorization": f"Bearer {token}"
    },
    params={
        "query": "搜索内容",
        "limit": 5,
        "type": "script"
    }
)
```

### 导入导出
```python
# 导入JSON文件
with open("documents.json", "rb") as f:
    response = requests.post(
        f"{API_URL}/api/v1/knowledge/documents/import",
        headers={
            "Authorization": f"Bearer {token}"
        },
        files={"file": f},
        params={"format": "json"}
    )

# 导出为CSV
response = requests.get(
    f"{API_URL}/api/v1/knowledge/documents/export",
    headers={
        "Authorization": f"Bearer {token}"
    },
    params={
        "format": "csv",
        "type": "script"
    }
)
```

## AI服务

### 获取写作建议
```python
response = requests.post(
    f"{API_URL}/api/v1/knowledge/suggestions/writing",
    headers={
        "Authorization": f"Bearer {token}"
    },
    json={
        "context": "当前剧本内容",
        "query": "如何改进对话"
    }
)
suggestion = response.json()["suggestion"]
```

### 获取角色设计建议
```python
response = requests.post(
    f"{API_URL}/api/v1/knowledge/suggestions/character",
    headers={
        "Authorization": f"Bearer {token}"
    },
    json={
        "description": "角色描述"
    }
)
suggestion = response.json()["suggestion"]
```

## 数据备份

### 创建备份
```python
# 创建全量备份
response = requests.post(
    f"{API_URL}/api/v1/backup/backups",
    headers={
        "Authorization": f"Bearer {token}"
    },
    params={"backup_type": "full"},
    json={
        "metadata": {
            "description": "每周全量备份"
        }
    }
)

# 创建增量备份
response = requests.post(
    f"{API_URL}/api/v1/backup/backups",
    headers={
        "Authorization": f"Bearer {token}"
    },
    params={"backup_type": "incremental"}
)
```

### 恢复备份
```python
response = requests.post(
    f"{API_URL}/api/v1/backup/backups/{backup_id}/restore",
    headers={
        "Authorization": f"Bearer {token}"
    }
)
```

## 最佳实践

### 错误处理
```python
try:
    response = requests.post(
        f"{API_URL}/api/v1/knowledge/documents",
        headers={
            "Authorization": f"Bearer {token}"
        },
        json={
            "content": "文档内容"
        }
    )
    response.raise_for_status()
    result = response.json()
except requests.exceptions.RequestException as e:
    if response.status_code == 401:
        # 处理认证错误
        refresh_token()
    elif response.status_code == 400:
        # 处理参数错误
        error = response.json()
        print(f"错误码: {error['code']}")
        print(f"错误信息: {error['message']}")
    else:
        # 处理其他错误
        print(f"请求失败: {str(e)}")
```

### 并发请求
```python
import asyncio
import aiohttp

async def add_documents(documents):
    async with aiohttp.ClientSession() as session:
        tasks = []
        for doc in documents:
            task = session.post(
                f"{API_URL}/api/v1/knowledge/documents",
                headers={
                    "Authorization": f"Bearer {token}"
                },
                json=doc
            )
            tasks.append(task)
        responses = await asyncio.gather(*tasks)
        return [r.json() for r in responses]
```

### 缓存处理
```python
import cachetools

# 创建缓存
token_cache = cachetools.TTLCache(maxsize=100, ttl=3600)

def get_token(username, password):
    # 检查缓存
    if username in token_cache:
        return token_cache[username]
    
    # 获取新令牌
    response = requests.post(
        f"{API_URL}/api/v1/auth/login",
        data={
            "username": username,
            "password": password
        }
    )
    token = response.json()["access_token"]
    
    # 更新缓存
    token_cache[username] = token
    return token
```

### 请求重试
```python
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry

# 配置重试策略
retry_strategy = Retry(
    total=3,
    backoff_factor=1,
    status_forcelist=[500, 502, 503, 504]
)

# 创建会话
session = requests.Session()
adapter = HTTPAdapter(max_retries=retry_strategy)
session.mount("http://", adapter)
session.mount("https://", adapter)

# 使用会话发送请求
response = session.post(
    f"{API_URL}/api/v1/knowledge/documents",
    headers={
        "Authorization": f"Bearer {token}"
    },
    json={
        "content": "文档内容"
    }
)
```

### 性能优化
1. 批量操作
   ```python
   # 使用批量接口而不是循环调用单个接口
   response = requests.post(
       f"{API_URL}/api/v1/knowledge/documents/batch",
       headers={
           "Authorization": f"Bearer {token}"
       },
       json={
           "documents": documents
       }
   )
   ```

2. 异步请求
   ```python
   async def search_all(queries):
       async with aiohttp.ClientSession() as session:
           tasks = []
           for query in queries:
               task = session.get(
                   f"{API_URL}/api/v1/knowledge/search",
                   headers={
                       "Authorization": f"Bearer {token}"
                   },
                   params={"query": query}
               )
               tasks.append(task)
           responses = await asyncio.gather(*tasks)
           return [r.json() for r in responses]
   ```

3. 合理使用缓存
   ```python
   # 缓存搜索结果
   search_cache = cachetools.TTLCache(maxsize=1000, ttl=300)

   def search_documents(query):
       cache_key = f"search:{query}"
       if cache_key in search_cache:
           return search_cache[cache_key]
       
       response = requests.get(
           f"{API_URL}/api/v1/knowledge/search",
           headers={
               "Authorization": f"Bearer {token}"
           },
           params={"query": query}
       )
       results = response.json()
       search_cache[cache_key] = results
       return results
   ```
``` 