# 剧本杀游戏平台技术方案

## 一、技术选型

### 1.1 基础设施
| 类别 | 方案 | 说明 |
|------|------|------|
| 容器化 | Docker | 应用容器化部署 |
| 编排 | Kubernetes | 容器编排管理 |
| 网关 | Nginx | 反向代理和负载均衡 |
| 消息队列 | RocketMQ | 分布式消息服务 |
| 缓存 | Redis | 分布式缓存 |

### 1.2 存储方案
| 类别 | 方案 | 说明 |
|------|------|------|
| 关系型数据库 | PostgreSQL | 主从架构 |
| 对象存储 | MinIO | 分布式对象存储 |
| 向量数据库 | Milvus | AI向量存储 |
| 缓存数据库 | Redis | 集群模式 |

### 1.3 AI方案
| 类别 | 方案 | 说明 |
|------|------|------|
| 对话模型 | DeepSeek-R1 | API调用，支持思维链，情感生成 |
| 小规模模型 | DeepSeek-R1-32B | 本地部署，用于实时交互 |
| 向量模型 | text2vec-base | 开源模型，用于内容检索 |
| 内容库 | 小说数据库 | 用于情感模式和情节参考 |

### 1.4 监控方案
| 类别 | 方案 | 说明 |
|------|------|------|
| 系统监控 | Prometheus | 时序数据库 |
| 日志收集 | ELK Stack | 日志分析 |
| 链路追踪 | SkyWalking | 分布式追踪 |
| 告警通知 | AlertManager | 告警管理 |

## 二、核心实现

### 2.1 情感剧本引擎
```python
class EmotionalScriptEngine:
    def __init__(self, base_template, player_count, theme):
        self.template = base_template
        self.player_count = player_count
        self.theme = theme
        self.emotion_system = EmotionSystem()
        self.content_library = ContentLibrary()
        
    def generate_script(self):
        """生成情感剧本"""
        # 1. 提取参考内容
        references = self.content_library.get_references(self.theme)
        
        # 2. 情感模式分析
        emotion_patterns = self.analyze_emotion_patterns(references)
        
        # 3. 创建核心元素
        core_elements = {
            'characters': self.design_characters(),
            'relationships': self.design_relationships(),
            'emotional_arcs': self.design_emotional_arcs(),
            'plot_points': self.design_plot_points()
        }
        
        # 4. 改编和创新
        adapted_content = self.adapt_content(core_elements, references)
        
        # 5. 生成最终剧本
        return self.assemble_script(adapted_content)
    
    def design_characters(self):
        """设计角色"""
        return {
            'main_characters': self.create_main_characters(),
            'supporting_roles': self.create_supporting_roles(),
            'character_backgrounds': self.create_backgrounds(),
            'personality_traits': self.create_personalities()
        }
    
    def design_relationships(self):
        """设计人物关系"""
        return {
            'relationship_network': self.create_relationship_network(),
            'emotional_bonds': self.create_emotional_bonds(),
            'conflict_points': self.create_conflict_points(),
            'development_arcs': self.create_relationship_arcs()
        }
    
    def design_emotional_arcs(self):
        """设计情感弧线"""
        return {
            'setup_phase': self.create_emotional_setup(),
            'development_phase': self.create_emotional_development(),
            'climax_phase': self.create_emotional_climax(),
            'resolution_phase': self.create_emotional_resolution()
        }
    
    def adapt_content(self, core_elements, references):
        """改编内容"""
        return {
            'adapted_plot': self.adapt_plot(references),
            'adapted_emotions': self.adapt_emotions(references),
            'adapted_climax': self.adapt_climax(references),
            'originality_check': self.check_originality()
        }

class EmotionSystem:
    def analyze_emotion_patterns(self, references):
        """分析情感模式"""
        return {
            'emotion_types': self.identify_emotion_types(),
            'emotion_transitions': self.analyze_transitions(),
            'emotion_intensity': self.analyze_intensity(),
            'emotion_conflicts': self.analyze_conflicts()
        }
    
    def create_emotional_bonds(self):
        """创建情感纽带"""
        return {
            'primary_bonds': self.create_primary_bonds(),
            'secondary_bonds': self.create_secondary_bonds(),
            'hidden_connections': self.create_hidden_connections()
        }

class ContentLibrary:
    def get_references(self, theme):
        """获取参考内容"""
        return {
            'similar_plots': self.find_similar_plots(theme),
            'emotion_patterns': self.find_emotion_patterns(theme),
            'character_archetypes': self.find_character_archetypes(theme),
            'relationship_templates': self.find_relationship_templates(theme)
        }
```

### 2.2 质量控制系统
```python
class QualityControl:
    def __init__(self):
        self.emotion_validator = EmotionValidator()
        self.plot_validator = PlotValidator()
        self.originality_checker = OriginalityChecker()
        
    def validate_script(self, script):
        """验证剧本质量"""
        return {
            'emotion_quality': self.validate_emotions(script),
            'plot_quality': self.validate_plot(script),
            'originality_score': self.check_originality(script),
            'engagement_metrics': self.analyze_engagement(script)
        }
    
    def validate_emotions(self, script):
        """验证情感质量"""
        return {
            'emotion_depth': self.check_emotion_depth(),
            'emotion_consistency': self.check_emotion_consistency(),
            'emotion_development': self.check_emotion_development(),
            'emotion_impact': self.check_emotion_impact()
        }
    
    def validate_plot(self, script):
        """验证情节质量"""
        return {
            'plot_coherence': self.check_plot_coherence(),
            'character_development': self.check_character_development(),
            'conflict_design': self.check_conflict_design(),
            'climax_effectiveness': self.check_climax_effectiveness()
        }
```

### 2.3 AI辅助接口
```python
@router.post("/ai/script/generate")
async def generate_script(request: ScriptGenerateRequest):
    """生成剧本"""
    client = DeepSeekClient(model="deepseek-reasoner")
    
    # 1. 分析主题和要求
    theme_analysis = await analyze_theme(request.theme)
    
    # 2. 获取参考内容
    references = await get_content_references(theme_analysis)
    
    # 3. 生成情感框架
    emotional_framework = await generate_emotional_framework(
        theme_analysis,
        references,
        temperature=0.8
    )
    
    # 4. 生成详细剧本
    script = await generate_detailed_script(
        emotional_framework,
        references,
        max_tokens=8000
    )
    
    # 5. 质量验证
    validation = await validate_script_quality(script)
    
    if validation.passed:
        return process_script(script)
    else:
        return await regenerate_script(validation.feedback)

@router.post("/ai/emotion/analyze")
async def analyze_emotion(request: EmotionAnalyzeRequest):
    """分析情感"""
    client = DeepSeekClient(model="deepseek-reasoner")
    
    # 1. 提取情感特征
    emotion_features = await extract_emotion_features(request.content)
    
    # 2. 分析情感模式
    emotion_patterns = await analyze_emotion_patterns(emotion_features)
    
    # 3. 生成情感建议
    suggestions = await generate_emotion_suggestions(
        emotion_patterns,
        temperature=0.6
    )
    
    return process_emotion_analysis(suggestions)
```

## 三、数据结构

### 3.1 数据库表结构
```sql
-- 游戏会话表
CREATE TABLE game_sessions (
    session_id UUID PRIMARY KEY,
    room_code VARCHAR(10) UNIQUE,
    host_id UUID,
    script_id UUID,
    game_state JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    voice_channel_id VARCHAR(50),
    active_players JSONB
);

-- 剧本模板表
CREATE TABLE script_templates (
    template_id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50),
    difficulty INTEGER,
    min_players INTEGER,
    max_players INTEGER,
    estimated_duration INTEGER,
    core_plot JSONB,
    role_templates JSONB,
    clue_graph JSONB,
    relationship_matrix JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 模板变体表
CREATE TABLE template_variants (
    variant_id UUID PRIMARY KEY,
    template_id UUID REFERENCES script_templates(template_id),
    player_count INTEGER,
    difficulty_level INTEGER,
    modified_roles JSONB,
    modified_clues JSONB,
    modified_relations JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 游戏进度追踪表
CREATE TABLE game_progress_tracking (
    tracking_id UUID PRIMARY KEY,
    session_id UUID REFERENCES game_sessions(session_id),
    current_phase VARCHAR(50),
    revealed_clues JSONB,
    player_states JSONB,
    host_notes TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.2 缓存结构
```python
# Redis缓存键设计
CACHE_KEYS = {
    # 房间信息缓存
    'room_info': 'room:{room_id}:info',
    # 用户会话缓存
    'user_session': 'user:{user_id}:session',
    # 剧本缓存
    'script_cache': 'script:{script_id}:content',
    # 实时状态缓存
    'game_state': 'game:{session_id}:state',
    # AI响应缓存
    'ai_response': 'ai:{request_id}:response',
}

# 缓存过期时间设置
CACHE_TTL = {
    'room_info': 3600,  # 1小时
    'user_session': 86400,  # 24小时
    'script_cache': 3600,  # 1小时
    'game_state': 300,  # 5分钟
    'ai_response': 600,  # 10分钟
}
```

## 四、API接口

### 4.1 房间管理接口
```python
@router.post("/rooms/create")
async def create_room(request: RoomCreateRequest):
    """创建游戏房间"""
    pass

@router.post("/rooms/{room_id}/join")
async def join_room(room_id: str, request: JoinRoomRequest):
    """加入游戏房间"""
    pass

@router.get("/rooms/{room_id}/state")
async def get_room_state(room_id: str):
    """获取房间状态"""
    pass
```

### 4.2 游戏流程接口
```python
@router.post("/games/{session_id}/start")
async def start_game(session_id: str):
    """开始游戏"""
    pass

@router.post("/games/{session_id}/clue/reveal")
async def reveal_clue(session_id: str, clue_id: str):
    """揭示线索"""
    pass

@router.post("/games/{session_id}/phase/next")
async def next_phase(session_id: str):
    """进入下一阶段"""
    pass
```

### 4.3 AI辅助接口
```python
@router.post("/ai/host/suggestions")
async def get_host_suggestions(request: SuggestionRequest):
    """获取主持建议"""
    client = DeepSeekClient(model="deepseek-reasoner")
    response = await client.generate(
        prompt=build_host_prompt(request),
        temperature=0.7,
        max_tokens=1000
    )
    return process_suggestions(response)

@router.post("/ai/script/generate")
async def generate_script(request: ScriptGenerateRequest):
    """生成剧本"""
    client = DeepSeekClient(model="deepseek-reasoner")
    response = await client.generate(
        prompt=build_script_prompt(request),
        temperature=0.8,
        max_tokens=5000
    )
    return process_script(response)

@router.post("/ai/emotion/analyze")
async def analyze_emotion(request: EmotionAnalyzeRequest):
    """分析情感"""
    client = DeepSeekClient(model="deepseek-reasoner")
    response = await client.generate(
        prompt=build_emotion_prompt(request),
        temperature=0.6,
        max_tokens=500
    )
    return process_emotion_analysis(response)
```

## 五、部署配置

### 5.1 Docker配置
```yaml
version: '3.8'
services:
  api:
    build: 
      context: .
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - DB_HOST=postgres
      - REDIS_HOST=redis
    depends_on:
      - postgres
      - redis
      
  postgres:
    image: postgres:13
    environment:
      - POSTGRES_USER=admin
      - POSTGRES_PASSWORD=secret
      - POSTGRES_DB=gamedb
      
  redis:
    image: redis:6
    ports:
      - "6379:6379"
```

### 5.2 K8s配置
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: game-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: game-service
  template:
    metadata:
      labels:
        app: game-service
    spec:
      containers:
      - name: game-service
        image: game-service:1.0
        ports:
        - containerPort: 8000
        resources:
          limits:
            cpu: "1"
            memory: "1Gi"
          requests:
            cpu: "500m"
            memory: "512Mi"
```

## 六、测试方案

### 6.1 单元测试
```python
class TemplateQualityTest(unittest.TestCase):
    def test_template_scalability(self):
        """测试模板可扩展性"""
        template = ScriptTemplate.load(template_id)
        variants = template.generate_variants(player_counts=[4,6,8])
        for variant in variants:
            self.assertTrue(self.validate_variant_quality(variant))
    
    def test_clue_distribution(self):
        """测试线索分布合理性"""
        template = ScriptTemplate.load(template_id)
        clue_graph = template.get_clue_graph()
        self.assertTrue(self.validate_clue_connectivity(clue_graph))
```

### 6.2 性能测试
```python
class PerformanceTest(unittest.TestCase):
    async def test_concurrent_users(self):
        """并发用户测试"""
        room = GameRoom()
        concurrent_users = 10
        self.assertTrue(await room.stress_test(concurrent_users))
        
    async def test_ai_response_time(self):
        """AI响应时间测试"""
        assistant = HostingAssistant()
        response_time = await assistant.measure_response_time()
        self.assertLess(response_time, 1000)  # 小于1秒
```

## 七、监控方案

### 7.1 监控指标
```python
# Prometheus指标定义
METRICS = {
    # 系统指标
    'system_cpu_usage': Gauge('system_cpu_usage', 'System CPU usage'),
    'system_memory_usage': Gauge('system_memory_usage', 'System memory usage'),
    
    # 业务指标
    'active_rooms': Gauge('active_rooms', 'Number of active game rooms'),
    'active_players': Gauge('active_players', 'Number of active players'),
    
    # AI指标
    'ai_response_time': Histogram('ai_response_time', 'DeepSeek API response time'),
    'ai_error_rate': Counter('ai_error_rate', 'DeepSeek API error rate'),
    'ai_token_usage': Counter('ai_token_usage', 'DeepSeek API token usage'),
    'ai_cache_hit_rate': Gauge('ai_cache_hit_rate', 'DeepSeek API cache hit rate')
}
```

### 7.2 告警规则
```yaml
groups:
- name: game_service_alerts
  rules:
  - alert: HighCPUUsage
    expr: system_cpu_usage > 80
    for: 5m
    labels:
      severity: warning
    annotations:
      description: "CPU usage is above 80%"
      
  - alert: HighMemoryUsage
    expr: system_memory_usage > 80
    for: 5m
    labels:
      severity: warning
    annotations:
      description: "Memory usage is above 80%"
      
  - alert: HighAIErrorRate
    expr: rate(ai_error_rate[5m]) > 0.1
    for: 5m
    labels:
      severity: critical
    annotations:
      description: "AI error rate is above 10%"
``` 
