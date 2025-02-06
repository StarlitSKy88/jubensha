# AI服务接口

## 角色分析

分析角色设定的合理性和完整性。

```http
POST /api/v1/ai/characters/analyze
Authorization: Bearer <token>
Content-Type: application/json

{
  "character": {
    "name": "角色名称",
    "gender": "male",
    "age": 28,
    "occupation": "医生",
    "description": "角色简介",
    "personality": {
      "traits": ["冷静", "理性", "谨慎"],
      "mbti": "INTJ"
    },
    "background": "角色背景故事",
    "motivation": "角色动机",
    "secrets": [
      {
        "content": "秘密内容",
        "level": "core"
      }
    ]
  },
  "options": {
    "aspects": ["personality", "motivation", "consistency"],
    "language": "zh_CN",
    "detail_level": "detailed"
  }
}
```

### 参数说明

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| character | object | 是 | 角色信息 |
| options | object | 否 | 分析选项 |
| options.aspects | string[] | 否 | 分析维度 |
| options.language | string | 否 | 返回语言(默认zh_CN) |
| options.detail_level | string | 否 | 详细程度(brief/normal/detailed) |

### 响应示例

```json
{
  "success": true,
  "message": "分析完成",
  "data": {
    "score": 0.85,
    "summary": "角色设定基本合理，但存在一些需要完善的地方",
    "aspects": {
      "personality": {
        "score": 0.9,
        "analysis": "性格特征描述完整，MBTI类型与特征匹配",
        "suggestions": [
          "可以添加一些性格缺陷",
          "建议补充在压力下的行为模式"
        ]
      },
      "motivation": {
        "score": 0.8,
        "analysis": "动机描述清晰，但与背景故事的关联可以更强",
        "suggestions": [
          "增加动机形成的关键事件",
          "补充动机与当前行为的关联"
        ]
      },
      "consistency": {
        "score": 0.85,
        "analysis": "人物设定基本连贯，职业背景与性格相符",
        "conflicts": [],
        "suggestions": [
          "建议补充职业经历细节",
          "可以增加一些个人习惯的描述"
        ]
      }
    },
    "suggestions": [
      {
        "aspect": "personality",
        "content": "建议添加性格缺陷",
        "priority": "high"
      },
      {
        "aspect": "background",
        "content": "补充职业经历细节",
        "priority": "medium"
      }
    ]
  }
}
```

## 情节建议

为剧本提供情节发展建议。

```http
POST /api/v1/ai/plots/suggest
Authorization: Bearer <token>
Content-Type: application/json

{
  "script": {
    "title": "剧本标题",
    "type": "murder",
    "summary": "剧本简介",
    "currentPlot": "当前情节",
    "characters": [
      {
        "id": "character_id1",
        "name": "角色1",
        "role": "主要角色"
      }
    ]
  },
  "target": {
    "type": "plot_development",
    "position": "next",
    "constraints": {
      "mustIncludeCharacters": ["character_id1"],
      "mood": "suspense",
      "duration": 30
    }
  },
  "options": {
    "count": 3,
    "detail_level": "detailed"
  }
}
```

### 参数说明

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| script | object | 是 | 剧本信息 |
| target | object | 是 | 目标要求 |
| target.type | string | 是 | 建议类型(plot_development/climax/ending) |
| target.position | string | 是 | 位置(next/specific) |
| target.constraints | object | 否 | 约束条件 |
| options | object | 否 | 生成选项 |
| options.count | number | 否 | 建议数量(默认3) |
| options.detail_level | string | 否 | 详细程度 |

### 响应示例

```json
{
  "success": true,
  "message": "生成完成",
  "data": {
    "suggestions": [
      {
        "id": "suggestion_id1",
        "title": "建议标题1",
        "description": "详细描述",
        "plot": "具体情节内容",
        "characters": [
          {
            "id": "character_id1",
            "name": "角色1",
            "action": "角色行动"
          }
        ],
        "duration": 30,
        "mood": "suspense",
        "confidence": 0.9,
        "reasoning": "建议理由说明"
      }
    ],
    "analysis": {
      "current_plot": {
        "strengths": ["节奏紧凑", "人物动机明确"],
        "weaknesses": ["线索铺垫不足"]
      },
      "suggestions": {
        "common_themes": ["矛盾升级", "线索揭示"],
        "variation_analysis": "建议方案各有特色，覆盖不同发展方向"
      }
    }
  }
}
```

## 对话生成

生成角色间的对话内容。

```http
POST /api/v1/ai/dialogues/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "context": {
    "scene": "场景描述",
    "mood": "紧张",
    "characters": [
      {
        "id": "character_id1",
        "name": "角色1",
        "state": "愤怒",
        "objective": "获取信息"
      },
      {
        "id": "character_id2",
        "name": "角色2",
        "state": "隐瞒",
        "objective": "保守秘密"
      }
    ],
    "previous_dialogues": [
      {
        "character_id": "character_id1",
        "content": "之前的对话1"
      }
    ]
  },
  "requirements": {
    "style": "自然对话",
    "key_information": ["需要透露的信息"],
    "duration": 5,
    "turn_count": 6
  },
  "options": {
    "temperature": 0.7,
    "detail_level": "detailed"
  }
}
```

### 参数说明

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| context | object | 是 | 对话上下文 |
| context.scene | string | 是 | 场景描述 |
| context.mood | string | 是 | 场景氛围 |
| context.characters | object[] | 是 | 参与角色 |
| requirements | object | 是 | 生成要求 |
| options | object | 否 | 生成选项 |

### 响应示例

```json
{
  "success": true,
  "message": "生成完成",
  "data": {
    "dialogues": [
      {
        "character_id": "character_id1",
        "character_name": "角色1",
        "content": "对话内容",
        "emotion": "愤怒",
        "subtext": "潜台词说明",
        "timestamp": 1
      }
    ],
    "analysis": {
      "key_points": ["信息1", "信息2"],
      "character_dynamics": {
        "character_id1": {
          "emotion_progression": ["愤怒", "怀疑"],
          "objective_achievement": 0.8
        }
      },
      "information_revelation": {
        "revealed": ["信息1"],
        "hidden": ["信息2"]
      }
    },
    "metadata": {
      "duration": 5,
      "turn_count": 6,
      "word_count": 200
    }
  }
}
```

## 线索分析

分析线索分布的合理性。

```http
POST /api/v1/ai/clues/analyze
Authorization: Bearer <token>
Content-Type: application/json

{
  "script": {
    "id": "script_id",
    "title": "剧本标题",
    "type": "murder",
    "difficulty": "medium"
  },
  "clues": [
    {
      "id": "clue_id1",
      "type": "physical",
      "content": "线索内容",
      "location": "发现位置",
      "discovery_time": "2024-02-08T10:00:00Z",
      "difficulty": "easy",
      "related_characters": ["character_id1"],
      "is_key": true
    }
  ],
  "options": {
    "aspects": ["distribution", "difficulty", "relevance"],
    "detail_level": "detailed"
  }
}
```

### 参数说明

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| script | object | 是 | 剧本信息 |
| clues | object[] | 是 | 线索列表 |
| options | object | 否 | 分析选项 |

### 响应示例

```json
{
  "success": true,
  "message": "分析完成",
  "data": {
    "score": 0.85,
    "summary": "线索分布基本合理，难度递进性好",
    "aspects": {
      "distribution": {
        "score": 0.9,
        "analysis": "线索时间和空间分布均匀",
        "timeline": {
          "early": 3,
          "middle": 5,
          "late": 2
        },
        "suggestions": [
          "建议在中期增加一个关键线索",
          "可以适当增加一些误导性线索"
        ]
      },
      "difficulty": {
        "score": 0.8,
        "analysis": "难度递进合理，但中期难度跨度较大",
        "distribution": {
          "easy": 4,
          "medium": 3,
          "hard": 3
        },
        "suggestions": [
          "建议在中期添加难度过渡线索",
          "可以降低最后一个线索的难度"
        ]
      },
      "relevance": {
        "score": 0.85,
        "analysis": "线索关联性强，构成完整证据链",
        "key_chains": [
          {
            "clues": ["clue_id1", "clue_id2"],
            "strength": 0.9
          }
        ],
        "suggestions": [
          "建议增强线索2和线索4的关联",
          "可以添加一条备用证据链"
        ]
      }
    },
    "suggestions": [
      {
        "priority": "high",
        "content": "在中期增加过渡难度线索",
        "reason": "改善难度递进性"
      }
    ]
  }
}
```

## 错误码

| 状态码 | 错误码 | 说明 |
|--------|--------|------|
| 400 | INVALID_PARAMS | 参数验证失败 |
| 401 | UNAUTHORIZED | 未认证或认证失败 |
| 403 | FORBIDDEN | 权限不足 |
| 404 | SCRIPT_NOT_FOUND | 剧本不存在 |
| 404 | CHARACTER_NOT_FOUND | 角色不存在 |
| 429 | TOO_MANY_REQUESTS | 请求频率超限 |
| 500 | AI_SERVICE_ERROR | AI服务错误 |
| 503 | SERVICE_UNAVAILABLE | 服务暂时不可用 | 