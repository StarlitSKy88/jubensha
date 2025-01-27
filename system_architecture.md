# 剧本杀游戏平台项目地图

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
        B3[CDN]
    end
    
    subgraph 业务层
        C1[用户服务]
        C2[游戏服务]
        C3[语音服务]
        C4[剧本服务]
    end
    
    subgraph 数据层
        D1[PostgreSQL]
        D2[MinIO]
        D3[Redis]
    end
    
    subgraph AI层
        E1[ChatGLM3]
        E2[书生浦语]
        E3[向量库]
    end
```

### 1.2 业务架构
```mermaid
graph LR
    A[用户系统] --> B[游戏房间]
    B --> C[语音系统]
    B --> D[剧本系统]
    D --> E[情感引擎]
    D --> F[内容库]
    E --> G[情感分析]
    F --> H[改编系统]
```

## 二、功能模块图

### 2.1 核心功能模块
```mermaid
graph TD
    A[剧本杀平台] --> B[用户管理]
    A --> C[房间管理]
    A --> D[剧本管理]
    A --> E[情感引擎]
    
    B --> B1[注册登录]
    B --> B2[个人中心]
    B --> B3[好友系统]
    
    C --> C1[房间创建]
    C --> C2[语音通话]
    C --> C3[实时互动]
    
    D --> D1[内容库管理]
    D --> D2[改编系统]
    D --> D3[质量控制]
    
    E --> E1[情感分析]
    E --> E2[情感生成]
    E --> E3[情感评估]
```

### 2.2 技术组件图
```mermaid
graph TD
    A[基础设施] --> B[计算资源]
    A --> C[存储资源]
    A --> D[网络资源]
    
    B --> B1[K8s集群]
    B --> B2[GPU服务器]
    
    C --> C1[PostgreSQL集群]
    C --> C2[MinIO集群]
    C --> C3[Redis集群]
    
    D --> D1[负载均衡]
    D --> D2[CDN]
    D --> D3[网络安全]
```

## 三、数据流向图

### 3.1 用户数据流
```mermaid
sequenceDiagram
    participant 用户
    participant API网关
    participant 用户服务
    participant 数据库
    
    用户->>API网关: 注册/登录请求
    API网关->>用户服务: 转发请求
    用户服务->>数据库: 查询/存储数据
    数据库-->>用户服务: 返回结果
    用户服务-->>API网关: 处理响应
    API网关-->>用户: 返回结果
```

### 3.2 游戏数据流
```mermaid
sequenceDiagram
    participant 玩家
    participant 游戏服务
    participant 情感引擎
    participant 内容库
    
    玩家->>游戏服务: 加入房间
    游戏服务->>情感引擎: 请求剧本
    情感引擎->>内容库: 获取参考
    内容库-->>情感引擎: 返回素材
    情感引擎-->>游戏服务: 生成剧本
    游戏服务-->>玩家: 分发角色
```

## 四、部署架构图

### 4.1 开发环境
```mermaid
graph TD
    A[开发环境] --> B[本地开发]
    A --> C[测试环境]
    
    B --> B1[Docker Desktop]
    B --> B2[本地数据库]
    B --> B3[本地AI模型]
    
    C --> C1[测试集群]
    C --> C2[测试数据库]
    C --> C3[测试AI服务]
```

### 4.2 生产环境
```mermaid
graph TD
    A[生产环境] --> B[计算集群]
    A --> C[存储集群]
    A --> D[AI集群]
    
    B --> B1[K8s Master]
    B --> B2[K8s Node1]
    B --> B3[K8s Node2]
    
    C --> C1[DB Master]
    C --> C2[DB Slave1]
    C --> C3[DB Slave2]
    
    D --> D1[AI Server1]
    D --> D2[AI Server2]
    D --> D3[AI Server3]
```

## 五、监控架构图

### 5.1 系统监控
```mermaid
graph TD
    A[监控系统] --> B[资源监控]
    A --> C[性能监控]
    A --> D[业务监控]
    
    B --> B1[CPU]
    B --> B2[内存]
    B --> B3[存储]
    
    C --> C1[响应时间]
    C --> C2[并发数]
    C --> C3[错误率]
    
    D --> D1[情感分析]
    D --> D2[内容改编]
    D --> D3[质量评估]
```

### 5.2 告警系统
```mermaid
graph TD
    A[告警系统] --> B[规则引擎]
    A --> C[通知系统]
    A --> D[处理流程]
    
    B --> B1[阈值规则]
    B --> B2[趋势规则]
    B --> B3[复合规则]
    
    C --> C1[邮件]
    C --> C2[短信]
    C --> C3[webhook]
    
    D --> D1[自动处理]
    D --> D2[人工处理]
    D --> D3[升级流程]
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
