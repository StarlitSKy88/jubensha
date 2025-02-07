# 剧本杀辅助系统

本系统提供剧本杀创作和管理的核心功能，包括向量检索和版本控制两个主要模块。

## 功能特性

### 向量检索模块
- 支持文本向量化存储
- 提供相似度搜索功能
- 支持带分数的搜索结果
- 支持本地持久化存储

### 版本控制模块
- 支持创建和管理多个版本
- 提供版本差异比较
- 支持版本回滚
- 完整的版本历史记录

## 安装说明

1. 克隆项目
```bash
git clone [项目地址]
cd jubensha
```

2. 创建虚拟环境（推荐）
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
```

3. 安装依赖
```bash
pip install -r requirements.txt
```

## 使用说明

1. 启动服务
```bash
python src/main.py
```

2. 访问API文档
- 向量检索API文档：http://localhost:8000/vector/docs
- 版本控制API文档：http://localhost:8000/version/docs

## API接口

### 向量检索接口
- POST /vector/texts/add - 添加文本到向量存储
- POST /vector/search - 相似度搜索
- POST /vector/search/with_score - 带分数的相似度搜索
- POST /vector/save - 保存向量存储
- POST /vector/load - 加载向量存储

### 版本控制接口
- POST /version/create - 创建新版本
- GET /version/{version_id} - 获取指定版本
- POST /version/diff - 获取版本差异
- GET /version/history - 获取版本历史
- POST /version/rollback/{version_id} - 回滚到指定版本

## 开发说明

### 项目结构
```
jubensha/
├── src/
│   ├── langchain/           # 向量检索模块
│   │   ├── api/            # API接口
│   │   ├── core/           # 核心实现
│   │   └── utils/          # 工具类
│   ├── version-control/     # 版本控制模块
│   │   ├── api/            # API接口
│   │   ├── core/           # 核心实现
│   │   └── utils/          # 工具类
│   └── main.py             # 主程序
├── data/                    # 数据存储目录
├── requirements.txt         # 依赖文件
└── README.md               # 项目说明
```

### 开发规范
1. 代码风格遵循PEP 8规范
2. 所有函数和类必须添加文档字符串
3. 提交代码前进行单元测试
4. 使用类型注解增加代码可读性

## 测试说明

1. 单元测试
```bash
python -m pytest tests/
```

2. API测试
使用Postman或curl测试API接口

## 注意事项

1. 确保data目录具有写入权限
2. 大文本建议使用文本分割工具处理
3. 定期备份版本数据

## 维护者

[维护者信息]

## 许可证

MIT License 