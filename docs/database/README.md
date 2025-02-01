# 数据库设计文档

## 数据库概述
项目使用PostgreSQL作为主要数据库，用于存储用户信息、项目数据、AI使用记录等核心业务数据。

## 数据库配置
- 数据库名：scriptai
- 用户名：postgres
- 端口：5432
- 字符集：UTF-8

## 表结构设计

### users 用户表
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    username VARCHAR UNIQUE NOT NULL,
    hashed_password VARCHAR NOT NULL,
    is_active BOOLEAN DEFAULT true,
    is_superuser BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### projects 项目表
```sql
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR NOT NULL,
    description TEXT,
    cover_url VARCHAR,
    status VARCHAR NOT NULL,
    user_id INTEGER REFERENCES users(id),
    version INTEGER DEFAULT 1,
    parent_version INTEGER REFERENCES projects(id),
    content JSONB,
    meta_info JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### ai_usages AI使用记录表
```sql
CREATE TABLE ai_usages (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    project_id INTEGER REFERENCES projects(id),
    operation_type VARCHAR NOT NULL,
    model_name VARCHAR NOT NULL,
    tokens_used INTEGER NOT NULL,
    processing_time FLOAT NOT NULL,
    cost FLOAT NOT NULL,
    request_params JSONB,
    response_metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 索引设计
1. users表
   - email_idx (email)
   - username_idx (username)

2. projects表
   - user_id_idx (user_id)
   - status_idx (status)
   - title_idx (title)

3. ai_usages表
   - user_id_idx (user_id)
   - project_id_idx (project_id)
   - created_at_idx (created_at)

## 数据库迁移
使用Alembic进行数据库版本控制和迁移：
```bash
# 创建迁移
alembic revision --autogenerate -m "描述"

# 执行迁移
alembic upgrade head
```

## 备份策略
1. 定时备份
   - 每日全量备份
   - 每小时增量备份

2. 备份内容
   - 数据库结构
   - 表数据
   - 索引

3. 恢复流程
   - 验证备份完整性
   - 恢复数据库结构
   - 恢复表数据
   - 重建索引 