# 剧本杀游戏平台系统架构

## 一、系统架构图

### 1.1 整体架构
```mermaid
graph TD
    A[用户层] --> B[接入层]
    B --> C[业务层]
    C --> D[数据层]
    C --> E[AI层]
    
    subgraph 用户层
        A1[Web前端]
        A2[移动端]
    end
    
    subgraph 接入层
        B1[API网关]
        B2[负载均衡]
        B3[WebSocket]
    end
    
    subgraph 业务层
        C1[用户服务]
        C2[房间服务]
        C3[游戏服务]
        C4[通讯服务]
    end
    
    subgraph 数据层
        D1[PostgreSQL]
        D2[Redis]
        D3[Milvus]
    end
    
    subgraph AI层
        E1[问卷系统]
        E2[剧本生成]
        E3[质量控制]
        E4[虚拟主持]
    end
```

### 1.2 业务流程图
```mermaid
graph LR
    A[用户登录] --> B[创建/加入房间]
    B --> C[问卷填写]
    C --> D[角色匹配]
    D --> E[剧本生成]
    E --> F[游戏进行]
    F --> G[结束评价]
```

## 二、功能模块图

### 2.1 AI引擎模块
```mermaid
graph TD
    A[AI引擎] --> B[问卷分析]
    A --> C[剧本生成]
    A --> D[质量控制]
    A --> E[虚拟主持]
    
    B --> B1[问题生成]
    B --> B2[特征分析]
    B --> B3[角色匹配]
    
    C --> C1[故事框架]
    C --> C2[角色关系]
    C --> C3[个人剧本]
    
    D --> D1[逻辑评估]
    D --> D2[质量优化]
    D --> D3[一致性检查]
    
    E --> E1[情境理解]
    E --> E2[对话生成]
    E --> E3[游戏引导]
```

### 2.2 实时通讯模块
```mermaid
graph TD
    A[通讯系统] --> B[语音聊天]
    A --> C[文字聊天]
    A --> D[状态同步]
    
    B --> B1[Agora SDK]
    B --> B2[音频处理]
    B --> B3[房间管理]
    
    C --> C1[WebSocket]
    C --> C2[消息广播]
    C --> C3[历史记录]
    
    D --> D1[Redis PubSub]
    D --> D2[状态更新]
    D --> D3[异常处理]
```

### 2.3 内容采集系统
```mermaid
graph TD
    A[内容采集系统] --> B[采集引擎]
    A --> C[任务管理]
    A --> D[内容处理]
    A --> E[配置管理]
    
    B --> B1[Web采集器]
    B --> B2[RSS采集器]
    B --> B3[文件系统采集器]
    
    C --> C1[任务调度]
    C --> C2[任务监控]
    C --> C3[错误处理]
    
    D --> D1[内容清洗]
    D --> D2[格式转换]
    D --> D3[质量评估]
    
    E --> E1[源配置]
    E --> E2[规则配置]
    E --> E3[调度配置]
```

### 2.4 采集流程图
```mermaid
sequenceDiagram
    participant 用户
    participant 配置系统
    participant 任务调度器
    participant 采集引擎
    participant 内容处理器
    participant 数据库
    
    用户->>配置系统: 创建内容源
    配置系统->>数据库: 保存配置
    任务调度器->>数据库: 获取待执行任务
    任务调度器->>采集引擎: 执行采集任务
    采集引擎->>内容处理器: 处理采集内容
    内容处理器->>数据库: 保存处理结果
    采集引擎-->>任务调度器: 返回执行状态
    任务调度器-->>数据库: 更新任务状态
```

### 2.5 数据流向图
```mermaid
graph LR
    A[内容源] --> B[采集引擎]
    B --> C[原始内容]
    C --> D[内容处理器]
    D --> E[处理后内容]
    E --> F[内容存储]
    
    G[配置管理] --> B
    G --> D
    
    H[监控系统] --> B
    H --> D
    H --> F
```

## 三、数据流向图

### 3.1 问卷流程
```mermaid
sequenceDiagram
    participant 用户
    participant 问卷系统
    participant AI引擎
    participant 数据库
    
    用户->>问卷系统: 填写问卷
    问卷系统->>AI引擎: 分析问卷
    AI引擎->>数据库: 存储结果
    AI引擎-->>问卷系统: 返回分析
    问卷系统-->>用户: 展示结果
```

### 3.2 剧本生成流程
```mermaid
sequenceDiagram
    participant 房间
    participant AI引擎
    participant 质量控制
    participant 数据库
    
    房间->>AI引擎: 请求生成剧本
    AI引擎->>质量控制: 评估质量
    质量控制-->>AI引擎: 返回评估
    AI引擎->>AI引擎: 优化剧本
    AI引擎->>数据库: 保存剧本
    AI引擎-->>房间: 分发角色
```

## 四、部署架构图

### 4.1 服务器架构
```mermaid
graph TD
    A[负载均衡器] --> B[应用服务器1]
    A --> C[应用服务器2]
    A --> D[应用服务器3]
    
    B --> E[数据库主]
    C --> E
    D --> E
    
    E --> F[数据库从1]
    E --> G[数据库从2]
```

### 4.2 缓存架构
```mermaid
graph TD
    A[应用服务器] --> B[Redis主]
    A --> C[Redis从1]
    A --> D[Redis从2]
    
    B --> C
    B --> D
```

## 五、监控架构图

### 5.1 系统监控
```mermaid
graph TD
    A[监控系统] --> B[性能监控]
    A --> C[业务监控]
    A --> D[AI监控]
    
    B --> B1[CPU/内存]
    B --> B2[网络IO]
    B --> B3[响应时间]
    
    C --> C1[在线人数]
    C --> C2[房间数量]
    C --> C3[成功率]
    
    D --> D1[生成质量]
    D --> D2[响应时间]
    D --> D3[优化效果]
```

### 5.2 告警系统
```mermaid
graph TD
    A[告警系统] --> B[系统告警]
    A --> C[业务告警]
    A --> D[AI告警]
    
    B --> B1[资源告警]
    B --> B2[性能告警]
    B --> B3[错误告警]
    
    C --> C1[房间异常]
    C --> C2[通讯异常]
    C --> C3[数据异常]
    
    D --> D1[生成失败]
    D --> D2[质量不达标]
    D --> D3[优化失败]
```

## 六、安全架构图

### 6.1 安全防护
```mermaid
graph TD
    A[安全系统] --> B[接入安全]
    A --> C[数据安全]
    A --> D[运行安全]
    
    B --> B1[WAF]
    B --> B2[DDoS防护]
    B --> B3[访问控制]
    
    C --> C1[数据加密]
    C --> C2[数据备份]
    C --> C3[数据审计]
    
    D --> D1[漏洞扫描]
    D --> D2[入侵检测]
    D --> D3[安全审计]
``` 
