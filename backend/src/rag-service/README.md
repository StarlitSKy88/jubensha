# RAG系统模块 (RAG Service)

## 功能描述

RAG（检索增强生成）系统模块负责管理和处理系统的知识库，为AI服务提供知识支持。

### 主要功能

1. 知识管理
   - 知识入库
   - 知识检索
   - 知识更新
   - 知识分类

2. 向量处理
   - 文本向量化
   - 向量索引
   - 相似度计算
   - 聚类分析

3. 检索增强
   - 上下文理解
   - 相关性排序
   - 知识融合
   - 结果优化

## 目录结构

```
rag-service/
├── controllers/     # 控制器层
├── services/        # 业务逻辑层
├── models/          # 数据模型层
├── routes/          # 路由定义
├── utils/           # 工具函数
├── tests/           # 测试文件
└── index.ts         # 模块入口
```

## API接口

### 知识库接口
- POST /api/knowledge - 添加知识
- GET /api/knowledge/:id - 获取知识
- PUT /api/knowledge/:id - 更新知识
- DELETE /api/knowledge/:id - 删除知识

### 检索接口
- POST /api/knowledge/search - 知识检索
- POST /api/knowledge/similar - 相似度查询
- GET /api/knowledge/recommend - 获取推荐

### 向量接口
- POST /api/vectors/encode - 文本向量化
- POST /api/vectors/similarity - 计算相似度
- POST /api/vectors/cluster - 向量聚类

## 开发计划

- [ ] 知识库基础功能 (5天)
- [ ] 向量处理系统 (7天)
- [ ] 检索优化功能 (5天)
- [ ] 性能调优 (3天)

## 依赖关系

- 依赖服务：
  - Milvus (向量数据库)
  - Elasticsearch (全文检索)
  - Redis (缓存)

## 技术栈

- Node.js
- TypeScript
- Express
- Milvus
- Elasticsearch
