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

# AI 服务 API

## 生成剧本大纲

使用 AI 生成剧本大纲。

### 请求

```http
POST /api/v1/ai/scripts/outline
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "string",
  "theme": "string",
  "genre": ["string"],
  "playerCount": {
    "min": number,
    "max": number
  },
  "duration": number,
  "settings": {
    "era": "string",
    "location": "string",
    "atmosphere": "string"
  },
  "requirements": {
    "complexity": number,
    "plotTwists": number,
    "characterCount": number
  },
  "preferences": {
    "style": "string",
    "focus": ["string"],
    "constraints": ["string"]
  }
}
```

### 参数说明

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| title | string | 是 | 剧本标题 |
| theme | string | 是 | 主题 |
| genre | string[] | 是 | 类型标签 |
| playerCount | object | 是 | 玩家人数设置 |
| playerCount.min | number | 是 | 最小人数 |
| playerCount.max | number | 是 | 最大人数 |
| duration | number | 是 | 预计时长(分钟) |
| settings | object | 否 | 背景设置 |
| settings.era | string | 否 | 时代背景 |
| settings.location | string | 否 | 地点背景 |
| settings.atmosphere | string | 否 | 氛围风格 |
| requirements | object | 否 | 要求设置 |
| requirements.complexity | number | 否 | 复杂度(1-5) |
| requirements.plotTwists | number | 否 | 剧情转折数量 |
| requirements.characterCount | number | 否 | 角色数量 |
| preferences | object | 否 | 偏好设置 |
| preferences.style | string | 否 | 写作风格 |
| preferences.focus | string[] | 否 | 重点关注方面 |
| preferences.constraints | string[] | 否 | 限制条件 |

### 响应

```json
{
  "success": true,
  "data": {
    "outline": {
      "summary": "string",
      "background": "string",
      "mainPlot": "string",
      "subplots": ["string"],
      "characters": [
        {
          "role": "string",
          "description": "string",
          "motivation": "string",
          "arc": "string"
        }
      ],
      "events": [
        {
          "phase": "string",
          "description": "string",
          "significance": "string"
        }
      ],
      "clues": [
        {
          "type": "string",
          "description": "string",
          "placement": "string"
        }
      ],
      "structure": {
        "setup": "string",
        "development": "string",
        "climax": "string",
        "resolution": "string"
      }
    },
    "metadata": {
      "tokens": number,
      "model": "string",
      "duration": number
    }
  }
}
```

## 生成角色设定

使用 AI 生成角色设定。

### 请求

```http
POST /api/v1/ai/characters/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "scriptId": "string",
  "role": "string",
  "requirements": {
    "gender": "string",
    "ageRange": "string",
    "occupation": "string",
    "personality": ["string"],
    "background": {
      "social": "string",
      "education": "string",
      "family": "string"
    }
  },
  "relationships": [
    {
      "targetId": "string",
      "type": "string",
      "context": "string"
    }
  ],
  "plotPoints": [
    {
      "event": "string",
      "involvement": "string"
    }
  ],
  "preferences": {
    "complexity": number,
    "morality": "string",
    "dramaticElements": ["string"]
  }
}
```

### 参数说明

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| scriptId | string | 是 | 剧本ID |
| role | string | 是 | 角色定位 |
| requirements | object | 是 | 角色要求 |
| requirements.gender | string | 否 | 性别要求 |
| requirements.ageRange | string | 否 | 年龄范围 |
| requirements.occupation | string | 否 | 职业要求 |
| requirements.personality | string[] | 否 | 性格特征 |
| requirements.background | object | 否 | 背景要求 |
| requirements.background.social | string | 否 | 社会背景 |
| requirements.background.education | string | 否 | 教育背景 |
| requirements.background.family | string | 否 | 家庭背景 |
| relationships | object[] | 否 | 关系要求 |
| relationships[].targetId | string | 是 | 目标角色ID |
| relationships[].type | string | 是 | 关系类型 |
| relationships[].context | string | 否 | 关系背景 |
| plotPoints | object[] | 否 | 剧情点 |
| plotPoints[].event | string | 是 | 事件描述 |
| plotPoints[].involvement | string | 是 | 参与方式 |
| preferences | object | 否 | 生成偏好 |
| preferences.complexity | number | 否 | 复杂度(1-5) |
| preferences.morality | string | 否 | 道德倾向 |
| preferences.dramaticElements | string[] | 否 | 戏剧元素 |

### 响应

```json
{
  "success": true,
  "data": {
    "character": {
      "name": "string",
      "gender": "string",
      "age": number,
      "occupation": "string",
      "description": "string",
      "personality": {
        "traits": ["string"],
        "values": ["string"],
        "habits": ["string"]
      },
      "background": {
        "summary": "string",
        "keyEvents": ["string"],
        "influences": ["string"]
      },
      "motivation": {
        "goals": ["string"],
        "fears": ["string"],
        "desires": ["string"]
      },
      "relationships": [
        {
          "targetId": "string",
          "type": "string",
          "dynamics": "string",
          "history": "string"
        }
      ],
      "secrets": [
        {
          "content": "string",
          "significance": "string",
          "revelation": "string"
        }
      ],
      "arc": {
        "development": "string",
        "challenges": ["string"],
        "resolution": "string"
      }
    },
    "metadata": {
      "tokens": number,
      "model": "string",
      "duration": number
    }
  }
}
```

## 生成事件描述

使用 AI 生成事件描述。

### 请求

```http
POST /api/v1/ai/events/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "scriptId": "string",
  "type": "string",
  "context": {
    "time": "string",
    "location": "string",
    "atmosphere": "string"
  },
  "participants": [
    {
      "characterId": "string",
      "role": "string",
      "motivation": "string"
    }
  ],
  "requirements": {
    "intensity": number,
    "duration": number,
    "complexity": number
  },
  "constraints": {
    "mustInclude": ["string"],
    "mustExclude": ["string"],
    "logicalDependencies": ["string"]
  },
  "preferences": {
    "style": "string",
    "focus": ["string"],
    "tone": "string"
  }
}
```

### 参数说明

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| scriptId | string | 是 | 剧本ID |
| type | string | 是 | 事件类型 |
| context | object | 是 | 事件背景 |
| context.time | string | 是 | 发生时间 |
| context.location | string | 是 | 发生地点 |
| context.atmosphere | string | 否 | 氛围描述 |
| participants | object[] | 是 | 参与者列表 |
| participants[].characterId | string | 是 | 角色ID |
| participants[].role | string | 是 | 参与角色 |
| participants[].motivation | string | 否 | 参与动机 |
| requirements | object | 否 | 事件要求 |
| requirements.intensity | number | 否 | 强度(1-5) |
| requirements.duration | number | 否 | 持续时间 |
| requirements.complexity | number | 否 | 复杂度(1-5) |
| constraints | object | 否 | 约束条件 |
| constraints.mustInclude | string[] | 否 | 必须包含的元素 |
| constraints.mustExclude | string[] | 否 | 必须排除的元素 |
| constraints.logicalDependencies | string[] | 否 | 逻辑依赖 |
| preferences | object | 否 | 生成偏好 |
| preferences.style | string | 否 | 描述风格 |
| preferences.focus | string[] | 否 | 重点关注 |
| preferences.tone | string | 否 | 语气基调 |

### 响应

```json
{
  "success": true,
  "data": {
    "event": {
      "title": "string",
      "description": "string",
      "sequence": [
        {
          "action": "string",
          "reaction": "string",
          "consequence": "string"
        }
      ],
      "participants": [
        {
          "characterId": "string",
          "role": "string",
          "actions": ["string"],
          "impact": "string"
        }
      ],
      "details": {
        "environment": "string",
        "atmosphere": "string",
        "sensoryDetails": ["string"]
      },
      "significance": {
        "plotImpact": "string",
        "characterDevelopment": ["string"],
        "revelations": ["string"]
      },
      "connections": {
        "prerequisites": ["string"],
        "consequences": ["string"],
        "relatedEvents": ["string"]
      }
    },
    "metadata": {
      "tokens": number,
      "model": "string",
      "duration": number
    }
  }
}
```

## 生成线索内容

使用 AI 生成线索内容。

### 请求

```http
POST /api/v1/ai/clues/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "scriptId": "string",
  "type": "string",
  "context": {
    "event": "string",
    "location": "string",
    "time": "string"
  },
  "relatedElements": {
    "characters": ["string"],
    "events": ["string"],
    "clues": ["string"]
  },
  "requirements": {
    "importance": number,
    "complexity": number,
    "obscurity": number
  },
  "constraints": {
    "format": "string",
    "length": "string",
    "style": "string"
  },
  "preferences": {
    "revealMethod": "string",
    "misdirection": boolean,
    "subtlety": number
  }
}
```

### 参数说明

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| scriptId | string | 是 | 剧本ID |
| type | string | 是 | 线索类型 |
| context | object | 是 | 线索背景 |
| context.event | string | 是 | 相关事件 |
| context.location | string | 是 | 出现位置 |
| context.time | string | 是 | 出现时间 |
| relatedElements | object | 否 | 关联元素 |
| relatedElements.characters | string[] | 否 | 相关角色 |
| relatedElements.events | string[] | 否 | 相关事件 |
| relatedElements.clues | string[] | 否 | 关联线索 |
| requirements | object | 否 | 线索要求 |
| requirements.importance | number | 否 | 重要程度(1-5) |
| requirements.complexity | number | 否 | 复杂度(1-5) |
| requirements.obscurity | number | 否 | 隐蔽度(1-5) |
| constraints | object | 否 | 约束条件 |
| constraints.format | string | 否 | 呈现形式 |
| constraints.length | string | 否 | 内容长度 |
| constraints.style | string | 否 | 表达风格 |
| preferences | object | 否 | 生成偏好 |
| preferences.revealMethod | string | 否 | 揭示方式 |
| preferences.misdirection | boolean | 否 | 是否误导 |
| preferences.subtlety | number | 否 | 微妙程度(1-5) |

### 响应

```json
{
  "success": true,
  "data": {
    "clue": {
      "title": "string",
      "content": "string",
      "description": "string",
      "appearance": {
        "physical": "string",
        "condition": "string",
        "details": ["string"]
      },
      "significance": {
        "meaning": "string",
        "implications": ["string"],
        "connections": ["string"]
      },
      "discovery": {
        "method": "string",
        "requirements": ["string"],
        "hints": ["string"]
      },
      "interpretation": {
        "obvious": "string",
        "hidden": "string",
        "misleading": "string"
      },
      "relationships": {
        "characters": [
          {
            "id": "string",
            "connection": "string",
            "knowledge": "string"
          }
        ],
        "events": [
          {
            "id": "string",
            "relevance": "string",
            "timing": "string"
          }
        ],
        "clues": [
          {
            "id": "string",
            "connection": "string",
            "sequence": "string"
          }
        ]
      }
    },
    "metadata": {
      "tokens": number,
      "model": "string",
      "duration": number
    }
  }
}
```

## 优化剧情结构

使用 AI 优化剧情结构。

### 请求

```http
POST /api/v1/ai/scripts/optimize
Authorization: Bearer <token>
Content-Type: application/json

{
  "scriptId": "string",
  "focus": ["string"],
  "requirements": {
    "pacing": "string",
    "complexity": number,
    "coherence": number
  },
  "constraints": {
    "duration": number,
    "characterCount": number,
    "plotPoints": number
  },
  "preferences": {
    "style": "string",
    "emphasis": ["string"],
    "balance": {
      "mystery": number,
      "action": number,
      "drama": number
    }
  }
}
```

### 参数说明

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| scriptId | string | 是 | 剧本ID |
| focus | string[] | 是 | 优化重点 |
| requirements | object | 否 | 优化要求 |
| requirements.pacing | string | 否 | 节奏要求 |
| requirements.complexity | number | 否 | 复杂度要求(1-5) |
| requirements.coherence | number | 否 | 连贯性要求(1-5) |
| constraints | object | 否 | 约束条件 |
| constraints.duration | number | 否 | 时长限制 |
| constraints.characterCount | number | 否 | 角色数量限制 |
| constraints.plotPoints | number | 否 | 剧情点数量限制 |
| preferences | object | 否 | 优化偏好 |
| preferences.style | string | 否 | 风格偏好 |
| preferences.emphasis | string[] | 否 | 强调方面 |
| preferences.balance | object | 否 | 元素平衡 |
| preferences.balance.mystery | number | 否 | 神秘感比重(0-1) |
| preferences.balance.action | number | 否 | 动作性比重(0-1) |
| preferences.balance.drama | number | 否 | 戏剧性比重(0-1) |

### 响应

```json
{
  "success": true,
  "data": {
    "analysis": {
      "overview": "string",
      "strengths": ["string"],
      "weaknesses": ["string"]
    },
    "suggestions": {
      "structure": [
        {
          "target": "string",
          "issue": "string",
          "solution": "string"
        }
      ],
      "pacing": [
        {
          "section": "string",
          "problem": "string",
          "adjustment": "string"
        }
      ],
      "characters": [
        {
          "character": "string",
          "issue": "string",
          "improvement": "string"
        }
      ],
      "plotPoints": [
        {
          "event": "string",
          "problem": "string",
          "resolution": "string"
        }
      ]
    },
    "optimizations": {
      "reordering": [
        {
          "element": "string",
          "from": "string",
          "to": "string",
          "reason": "string"
        }
      ],
      "additions": [
        {
          "type": "string",
          "content": "string",
          "purpose": "string"
        }
      ],
      "removals": [
        {
          "element": "string",
          "reason": "string",
          "impact": "string"
        }
      ],
      "modifications": [
        {
          "target": "string",
          "changes": "string",
          "benefit": "string"
        }
      ]
    },
    "metadata": {
      "tokens": number,
      "model": "string",
      "duration": number
    }
  }
}
```

## 错误码

| 错误码 | 描述 | HTTP状态码 |
|--------|------|------------|
| AI_SERVICE_ERROR | AI服务异常 | 500 |
| AI_INVALID_REQUEST | 无效的请求参数 | 400 |
| AI_GENERATION_FAILED | 内容生成失败 | 500 |
| AI_QUOTA_EXCEEDED | 配额超限 | 429 |
| AI_MODEL_NOT_AVAILABLE | 模型不可用 | 503 |
| AI_CONTENT_FILTERED | 内容被过滤 | 400 |
| AI_CONTEXT_TOO_LONG | 上下文过长 | 400 |
| AI_RESPONSE_TIMEOUT | 响应超时 | 504 | 