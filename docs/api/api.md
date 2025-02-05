# API 文档

## 基础信息

- 基础路径：`/api`
- 请求格式：`application/json`
- 响应格式：`application/json`
- 认证方式：Bearer Token

## 错误处理

所有 API 响应都遵循以下格式：

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {}
}
```

错误响应示例：

```json
{
  "code": 400,
  "message": "请求参数错误",
  "errors": [
    {
      "field": "name",
      "message": "角色名称不能为空"
    }
  ]
}
```

## 角色管理

### 获取角色列表

```http
GET /characters?projectId={projectId}
```

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| projectId | string | 是 | 项目ID |

#### 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": "char_123",
      "projectId": "proj_456",
      "name": "张三",
      "role": "protagonist",
      "archetype": "英雄",
      "personality": {
        "traits": ["勇敢", "正直"],
        "mbti": "INFJ",
        "strengths": ["领导力", "决断力"],
        "weaknesses": ["固执", "急躁"]
      },
      "background": {
        "age": 25,
        "occupation": "警察",
        "education": "警察学院",
        "family": "父母健在，有一个妹妹",
        "history": "从小立志成为一名警察..."
      },
      "motivation": {
        "goals": ["伸张正义", "保护弱小"],
        "fears": ["失去亲人", "无能为力"],
        "desires": ["升职加薪", "找到真爱"]
      },
      "arc": {
        "startingPoint": "初出茅庐的菜鸟警察",
        "keyEvents": [
          "第一次执行危险任务",
          "搭档牺牲",
          "破获大案"
        ],
        "endingPoint": "成为优秀的刑警队长"
      },
      "relationships": [
        {
          "characterId": "char_789",
          "type": "mentor",
          "description": "老练的前辈，亦师亦友"
        }
      ],
      "analysis": {
        "depth": {
          "score": 85,
          "details": "角色形象丰满，内心世界复杂..."
        },
        "consistency": {
          "score": 90,
          "details": "性格特征、动机和行为高度一致..."
        },
        "development": {
          "score": 88,
          "details": "角色成长轨迹清晰，转变自然..."
        }
      },
      "createdAt": "2023-12-20T08:00:00Z",
      "updatedAt": "2023-12-20T09:00:00Z"
    }
  ]
}
```

### 获取角色详情

```http
GET /characters/{id}
```

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 角色ID |

#### 响应示例

同角色列表中的单个角色对象

### 创建角色

```http
POST /characters
```

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| projectId | string | 是 | 项目ID |
| name | string | 是 | 角色名称 |
| role | string | 是 | 角色类型（protagonist/antagonist/supporting） |
| archetype | string | 是 | 角色原型 |
| personality | object | 是 | 性格特征 |
| background | object | 否 | 背景设定 |
| motivation | object | 否 | 动机设定 |
| arc | object | 否 | 角色弧光 |

#### 响应示例

返回创建的角色对象

### 更新角色

```http
PUT /characters/{id}
```

#### 请求参数

同创建角色，但所有字段都是可选的

#### 响应示例

返回更新后的角色对象

### 删除角色

```http
DELETE /characters/{id}
```

#### 响应示例

```json
{
  "code": 200,
  "message": "删除成功"
}
```

## 角色关系

### 获取角色关系

```http
GET /characters/{id}/relationships
```

#### 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": "rel_123",
      "sourceId": "char_123",
      "targetId": "char_456",
      "type": "friend",
      "description": "青梅竹马的好友"
    }
  ]
}
```

### 添加角色关系

```http
POST /characters/{id}/relationships
```

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| targetId | string | 是 | 目标角色ID |
| type | string | 是 | 关系类型 |
| description | string | 否 | 关系描述 |

#### 响应示例

返回更新后的角色对象

### 更新角色关系

```http
PUT /characters/{id}/relationships/{targetId}
```

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | string | 否 | 关系类型 |
| description | string | 否 | 关系描述 |

#### 响应示例

返回更新后的角色对象

### 删除角色关系

```http
DELETE /characters/{id}/relationships/{targetId}
```

#### 响应示例

返回更新后的角色对象

## 角色分析

### 分析角色

```http
POST /characters/{id}/analyze
```

#### 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "depth": {
      "score": 85,
      "details": "角色形象丰满，内心世界复杂..."
    },
    "consistency": {
      "score": 90,
      "details": "性格特征、动机和行为高度一致..."
    },
    "development": {
      "score": 88,
      "details": "角色成长轨迹清晰，转变自然..."
    }
  }
}
```

### 批量分析角色

```http
POST /characters/analyze/batch
```

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| ids | string[] | 否 | 角色ID列表，为空则分析所有角色 |

#### 响应示例

返回包含分析结果的角色列表

## 导入导出

### 导出角色

```http
GET /characters/export
```

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| ids | string[] | 否 | 角色ID列表，为空则导出所有角色 |
| format | string | 否 | 导出格式（json/md），默认json |

#### 响应

文件下载

### 导入角色

```http
POST /characters/import
```

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file | file | 是 | 角色数据文件（json格式） |
| projectId | string | 是 | 导入到的项目ID |

#### 响应示例

返回导入的角色列表 