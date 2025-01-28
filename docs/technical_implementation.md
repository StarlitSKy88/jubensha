# 剧本杀游戏平台技术方案

## 一、技术选型

### 1.1 基础设施
| 类别 | 方案 | 说明 |
|------|------|------|
| 服务器 | Linux | 标准服务器部署 |
| 网关 | Nginx | 反向代理和负载均衡 |
| 消息队列 | RocketMQ | 分布式消息服务 |
| 缓存 | Redis | 分布式缓存 |

### 1.2 存储方案
| 类别 | 方案 | 说明 |
|------|------|------|
| 关系型数据库 | PostgreSQL | 主从架构 |
| 向量数据库 | Milvus | AI向量存储 |
| 缓存数据库 | Redis | 集群模式 |

### 1.3 AI方案
| 类别 | 方案 | 说明 |
|------|------|------|
| 对话模型 | DeepSeek-R1 | 核心生成模型，负责剧本创作 |
| 小规模模型 | DeepSeek-R1-32B | 本地部署，用于实时主持和对话 |
| 向量模型 | text2vec-base | 用于问卷分析和角色匹配 |
| 质量控制 | QualityGPT | 基于DeepSeek的质量评估模型 |
| 情节优化 | StoryGPT | 基于DeepSeek的情节优化模型 |

### 1.4 质量控制方案
| 类别 | 方案 | 说明 |
|------|------|------|
| 问卷分析 | 深度特征提取 | 多维度性格特征分析 |
| 角色匹配 | 向量相似度计算 | 基于问卷的最优角色分配 |
| 剧本评估 | 多维度质量评估 | 情节/人物/逻辑综合评分 |
| 实时优化 | 动态调整系统 | 根据反馈实时优化生成 |

### 1.5 监控方案
| 类别 | 方案 | 说明 |
|------|------|------|
| 系统监控 | Prometheus | 时序数据库 |
| 日志收集 | ELK Stack | 日志分析 |
| 链路追踪 | SkyWalking | 分布式追踪 |
| 告警通知 | AlertManager | 告警管理 |

### 1.6 实时互动方案
| 类别 | 方案 | 说明 |
|------|------|------|
| 语音聊天 | Agora SDK | 实时语音通讯 |
| 文字聊天 | WebSocket | 实时文字消息 |
| 虚拟主持 | AI Host | 基于DeepSeek的实时主持系统 |
| 状态同步 | Redis Pub/Sub | 游戏状态实时同步 |

## 二、核心实现

### 2.1 剧本结构设计
```python
class ScriptStructure:
    def __init__(self):
        self.story_framework = StoryFramework()
        self.character_system = CharacterSystem()
        self.clue_system = ClueSystem()
        self.game_progress = GameProgress()
        
    async def generate_structure(self, player_count, theme, difficulty):
        """生成剧本结构"""
        # 1. 生成故事框架
        story = await self.story_framework.generate({
            'player_count': player_count,
            'theme': theme,
            'difficulty': difficulty,
            'structure': {
                'background': '故事背景和世界观',
                'main_plot': '主要剧情线',
                'sub_plots': '支线剧情',
                'timeline': '故事时间线',
                'locations': '场景设定'
            }
        })
        
        # 2. 设计角色系统
        characters = await self.character_system.design({
            'player_count': player_count,
            'story': story,
            'character_types': {
                'core_characters': '核心角色',
                'support_characters': '支持角色',
                'hidden_characters': '隐藏角色'
            }
        })
        
        # 3. 设计线索系统
        clues = await self.clue_system.design({
            'story': story,
            'characters': characters,
            'clue_types': {
                'key_clues': '关键线索',
                'sub_clues': '次要线索',
                'misleading_clues': '误导线索',
                'hidden_clues': '隐藏线索'
            }
        })
        
        # 4. 设计游戏进程
        progress = await self.game_progress.design({
            'story': story,
            'characters': characters,
            'clues': clues,
            'phases': {
                'preparation': '准备阶段',
                'investigation': '调查阶段',
                'discussion': '讨论阶段',
                'reasoning': '推理阶段',
                'revelation': '真相揭示'
            }
        })
        
        return {
            'story': story,
            'characters': characters,
            'clues': clues,
            'progress': progress
        }

class StoryFramework:
    async def generate(self, params):
        """生成故事框架"""
        # 1. 生成故事背景
        background = await self.generate_background(params['theme'])
        
        # 2. 设计主线剧情
        main_plot = await self.design_main_plot({
            'background': background,
            'player_count': params['player_count'],
            'difficulty': params['difficulty']
        })
        
        # 3. 设计支线剧情
        sub_plots = await self.design_sub_plots({
            'main_plot': main_plot,
            'player_count': params['player_count']
        })
        
        # 4. 构建时间线
        timeline = await self.build_timeline({
            'main_plot': main_plot,
            'sub_plots': sub_plots
        })
        
        # 5. 设计场景
        locations = await self.design_locations({
            'timeline': timeline,
            'plots': {**main_plot, **sub_plots}
        })
        
        return {
            'background': background,
            'main_plot': main_plot,
            'sub_plots': sub_plots,
            'timeline': timeline,
            'locations': locations
        }

class CharacterSystem:
    async def design(self, params):
        """设计角色系统"""
        # 1. 角色关系网络
        relationships = await self.generate_relationships(
            params['player_count']
        )
        
        # 2. 角色背景故事
        backgrounds = await self.generate_backgrounds(
            relationships
        )
        
        # 3. 角色动机设计
        motivations = await self.design_motivations({
            'relationships': relationships,
            'story': params['story']
        })
        
        # 4. 角色能力设计
        abilities = await self.design_abilities({
            'player_count': params['player_count'],
            'difficulty': params['story']['difficulty']
        })
        
        # 5. 角色平衡调整
        balanced_chars = await self.balance_characters({
            'relationships': relationships,
            'backgrounds': backgrounds,
            'motivations': motivations,
            'abilities': abilities
        })
        
        return balanced_chars

class ClueSystem:
    async def design(self, params):
        """设计线索系统"""
        # 1. 关键线索设计
        key_clues = await self.design_key_clues({
            'story': params['story'],
            'characters': params['characters']
        })
        
        # 2. 次要线索设计
        sub_clues = await self.design_sub_clues({
            'key_clues': key_clues,
            'characters': params['characters']
        })
        
        # 3. 误导线索设计
        misleading_clues = await self.design_misleading_clues({
            'key_clues': key_clues,
            'sub_clues': sub_clues
        })
        
        # 4. 线索分布优化
        distributed_clues = await self.optimize_distribution({
            'key_clues': key_clues,
            'sub_clues': sub_clues,
            'misleading_clues': misleading_clues,
            'characters': params['characters']
        })
        
        return distributed_clues

class GameProgress:
    async def design(self, params):
        """设计游戏进程"""
        # 1. 阶段设计
        phases = await self.design_phases({
            'story': params['story'],
            'characters': params['characters'],
            'clues': params['clues']
        })
        
        # 2. 信息解锁机制
        info_unlock = await self.design_info_unlock({
            'phases': phases,
            'clues': params['clues']
        })
        
        # 3. 事件触发机制
        events = await self.design_events({
            'phases': phases,
            'story': params['story']
        })
        
        # 4. 进度控制机制
        progress_control = await self.design_progress_control({
            'phases': phases,
            'events': events,
            'info_unlock': info_unlock
        })
        
        return {
            'phases': phases,
            'info_unlock': info_unlock,
            'events': events,
            'progress_control': progress_control
        }

class GameBalancer:
    async def balance_game(self, script):
        """游戏平衡调整"""
        # 1. 角色平衡性
        character_balance = await self.check_character_balance({
            'characters': script['characters'],
            'clues': script['clues']
        })
        
        # 2. 信息平衡性
        info_balance = await self.check_info_balance({
            'clues': script['clues'],
            'progress': script['progress']
        })
        
        # 3. 难度平衡性
        difficulty_balance = await self.check_difficulty_balance({
            'story': script['story'],
            'clues': script['clues'],
            'characters': script['characters']
        })
        
        # 4. 时间平衡性
        time_balance = await self.check_time_balance({
            'progress': script['progress'],
            'clues': script['clues']
        })
        
        # 5. 执行平衡调整
        if not all([
            character_balance.balanced,
            info_balance.balanced,
            difficulty_balance.balanced,
            time_balance.balanced
        ]):
            script = await self.adjust_balance(script, {
                'character_balance': character_balance,
                'info_balance': info_balance,
                'difficulty_balance': difficulty_balance,
                'time_balance': time_balance
            })
        
        return script

class VirtualGameMaster:
    def __init__(self):
        self.model = DeepSeekClient(model="deepseek-reasoner")
        self.game_state = GameState()
        self.script_manager = ScriptManager()
        
    async def guide_game(self, room):
        """引导游戏进程"""
        # 1. 初始化游戏
        await self.initialize_game(room)
        
        # 2. 游戏进行时
        while not room.is_finished:
            # 获取当前阶段
            current_phase = await self.game_state.get_current_phase(room)
            
            # 分析游戏状态
            state_analysis = await self.analyze_game_state(room)
            
            # 生成引导建议
            guidance = await self.generate_guidance(state_analysis)
            
            # 执行引导
            await self.execute_guidance(room, guidance)
            
            # 检查阶段转换
            await self.check_phase_transition(room)
        
        # 3. 结束游戏
        await self.end_game(room)
    
    async def analyze_game_state(self, room):
        """分析游戏状态"""
        return {
            'progress': await self.analyze_progress(room),
            'player_states': await self.analyze_player_states(room),
            'clue_distribution': await self.analyze_clue_distribution(room),
            'discussion_status': await self.analyze_discussion_status(room)
        }
    
    async def generate_guidance(self, state_analysis):
        """生成引导建议"""
        return await self.model.generate(
            prompt=self.build_guidance_prompt(state_analysis),
            temperature=0.7
        )
    
    async def execute_guidance(self, room, guidance):
        """执行引导"""
        # 1. 发送主持人消息
        await room.broadcast_host_message(guidance['message'])
        
        # 2. 触发事件（如果有）
        if guidance.get('event'):
            await self.trigger_event(room, guidance['event'])
        
        # 3. 更新游戏状态
        await self.game_state.update(room, guidance['state_updates'])
```

### 2.2 游戏流程引擎
```python
class GameFlowEngine:
    def __init__(self):
        self.questionnaire_system = QuestionnaireSystem()
        self.script_generator = ScriptGenerator()
        self.virtual_host = VirtualGameMaster()
        self.chat_system = ChatSystem()
        self.script_structure = ScriptStructure()
        
    async def create_game_room(self, host_user_id, player_count, theme, difficulty):
        """创建游戏房间"""
        # 1. 创建房间
        room = GameRoom(host_user_id, player_count)
        await room.initialize()
        
        # 2. 生成剧本结构
        script_structure = await self.script_structure.generate_structure(
            player_count,
            theme,
            difficulty
        )
        await room.set_script_structure(script_structure)
        
        return room.room_code
        
    async def join_game_room(self, room_code, user_id):
        """加入游戏房间"""
        room = await GameRoom.get(room_code)
        await room.add_player(user_id)
        return room.status
        
    async def start_questionnaire(self, room_code):
        """开始问卷调查"""
        room = await GameRoom.get(room_code)
        script_structure = await room.get_script_structure()
        
        # 生成针对性问卷
        questionnaires = await self.questionnaire_system.generate_for_players(
            room.player_count,
            script_structure
        )
        await room.distribute_questionnaires(questionnaires)
        
    async def analyze_and_match(self, room_code, questionnaire_results):
        """分析问卷并匹配角色"""
        room = await GameRoom.get(room_code)
        script_structure = await room.get_script_structure()
        
        # 1. 分析问卷结果
        analysis = await self.questionnaire_system.analyze_results(
            questionnaire_results
        )
        
        # 2. 角色匹配
        character_matches = await self.match_characters(
            analysis,
            script_structure['characters']
        )
        
        # 3. 优化匹配结果
        optimized_matches = await self.optimize_matches(
            character_matches,
            analysis,
            script_structure
        )
        
        return optimized_matches
        
    async def generate_scripts(self, room_code, character_matches):
        """生成角色剧本"""
        room = await GameRoom.get(room_code)
        script_structure = await room.get_script_structure()
        
        # 1. 生成初始剧本
        scripts = await self.script_generator.generate_character_scripts(
            character_matches,
            script_structure
        )
        
        # 2. 平衡性调整
        balanced_scripts = await self.balance_scripts(
            scripts,
            script_structure
        )
        
        # 3. 分发剧本
        await room.distribute_scripts(balanced_scripts)
        
    async def start_game(self, room_code):
        """开始游戏"""
        room = await GameRoom.get(room_code)
        
        # 1. 初始化虚拟主持人
        await self.virtual_host.initialize(room)
        
        # 2. 初始化通讯系统
        await self.chat_system.initialize(room)
        
        # 3. 开始游戏流程
        await room.start_game()
        await self.virtual_host.guide_game(room)
        
    async def match_characters(self, analysis, characters):
        """匹配角色"""
        matches = {}
        available_chars = characters.copy()
        
        for user_id, traits in analysis['individual_traits'].items():
            # 1. 计算匹配度
            match_scores = await self.calculate_match_scores(
                traits,
                available_chars
            )
            
            # 2. 选择最佳匹配
            best_match = max(match_scores.items(), key=lambda x: x[1])
            matches[user_id] = available_chars[best_match[0]]
            
            # 3. 移除已分配角色
            del available_chars[best_match[0]]
            
        return matches
        
    async def optimize_matches(self, matches, analysis, script_structure):
        """优化角色匹配"""
        # 1. 评估当前匹配
        evaluation = await self.evaluate_matches(
            matches,
            analysis,
            script_structure
        )
        
        # 2. 如果匹配度不够理想，尝试优化
        if evaluation.score < 0.8:
            optimized_matches = await self.rebalance_matches(
                matches,
                analysis,
                script_structure,
                evaluation.feedback
            )
            return optimized_matches
            
        return matches
        
    async def balance_scripts(self, scripts, script_structure):
        """平衡剧本"""
        balancer = GameBalancer()
        return await balancer.balance_game({
            'scripts': scripts,
            'structure': script_structure
        })

class GameRoom:
    def __init__(self, host_id, player_count):
        self.room_code = self.generate_room_code()
        self.host_id = host_id
        self.player_count = player_count
        self.players = {}
        self.status = 'created'
        self.script_structure = None
        self.scripts = {}
        self.game_state = GameState()
        
    async def initialize(self):
        """初始化房间"""
        self.status = 'waiting'
        
    async def add_player(self, user_id):
        """添加玩家"""
        if len(self.players) < self.player_count:
            self.players[user_id] = {
                'status': 'joined',
                'questionnaire': None,
                'script': None
            }
            return True
        return False
        
    async def set_script_structure(self, structure):
        """设置剧本结构"""
        self.script_structure = structure
        
    async def get_script_structure(self):
        """获取剧本结构"""
        return self.script_structure
        
    async def distribute_questionnaires(self, questionnaires):
        """分发问卷"""
        for user_id, questionnaire in questionnaires.items():
            self.players[user_id]['questionnaire'] = questionnaire
            
    async def distribute_scripts(self, scripts):
        """分发剧本"""
        self.scripts = scripts
        for user_id, script in scripts.items():
            self.players[user_id]['script'] = script
            
    async def start_game(self):
        """开始游戏"""
        self.status = 'in_progress'
        self.game_state.initialize(self.script_structure)
        
    def generate_room_code(self):
        """生成房间码"""
        return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

class GameState:
    def __init__(self):
        self.current_phase = None
        self.revealed_clues = set()
        self.player_states = {}
        self.events = []
        self.timeline = []
        
    def initialize(self, script_structure):
        """初始化游戏状态"""
        self.current_phase = 'preparation'
        self.script_structure = script_structure
        
    async def update(self, updates):
        """更新游戏状态"""
        for key, value in updates.items():
            if hasattr(self, key):
                setattr(self, key, value)
                
    async def reveal_clue(self, clue_id):
        """揭示线索"""
        self.revealed_clues.add(clue_id)
        
    async def record_event(self, event):
        """记录事件"""
        self.events.append(event)
        self.timeline.append({
            'time': datetime.now(),
            'event': event
        })
        
    async def get_current_phase(self):
        """获取当前阶段"""
        return self.current_phase
```

### 2.3 问卷分析系统
```python
class QuestionnaireSystem:
    def __init__(self):
        self.model = DeepSeekClient(model="deepseek-reasoner")
        self.analyzer = QuestionnaireAnalyzer()
        
    async def generate_for_players(self, player_count, script_structure):
        """为所有玩家生成问卷"""
        # 1. 生成基础问题
        base_questions = await self.generate_base_questions(
            script_structure['story']
        )
        
        # 2. 生成角色相关问题
        role_questions = await self.generate_role_questions(
            script_structure['characters']
        )
        
        # 3. 生成互动问题
        interaction_questions = await self.generate_interaction_questions(
            player_count
        )
        
        # 4. 生成个性化问卷
        questionnaires = {}
        for i in range(player_count):
            questionnaire = await self.customize_questionnaire(
                base_questions,
                role_questions,
                interaction_questions,
                i
            )
            questionnaires[i] = questionnaire
            
        return questionnaires
        
    async def analyze_results(self, results):
        """分析问卷结果"""
        return await self.analyzer.analyze_group_results(results)
        
    async def generate_base_questions(self, story):
        """生成基础问题"""
        return await self.model.generate(
            prompt=self.build_base_question_prompt(story),
            temperature=0.7
        )
        
    async def generate_role_questions(self, characters):
        """生成角色相关问题"""
        return await self.model.generate(
            prompt=self.build_role_question_prompt(characters),
            temperature=0.7
        )
        
    async def generate_interaction_questions(self, player_count):
        """生成互动问题"""
        return await self.model.generate(
            prompt=self.build_interaction_question_prompt(player_count),
            temperature=0.7
        )
        
    async def customize_questionnaire(self, base, role, interaction, index):
        """生成个性化问卷"""
        return {
            'base_questions': base,
            'role_questions': role,
            'interaction_questions': interaction,
            'sequence': self.optimize_question_sequence(base, role, interaction)
        }

class QuestionnaireAnalyzer:
    def __init__(self):
        self.model = DeepSeekClient(model="deepseek-reasoner")
        
    async def analyze_group_results(self, results):
        """分析团队问卷结果"""
        # 1. 提取个人特征
        individual_traits = await self.extract_individual_traits(results)
        
        # 2. 分析团队动态
        group_dynamics = await self.analyze_group_dynamics(individual_traits)
        
        # 3. 分析互动倾向
        interaction_patterns = await self.analyze_interaction_patterns(
            results,
            individual_traits
        )
        
        # 4. 生成角色匹配建议
        role_suggestions = await self.generate_role_suggestions(
            individual_traits,
            group_dynamics,
            interaction_patterns
        )
        
        return {
            'individual_traits': individual_traits,
            'group_dynamics': group_dynamics,
            'interaction_patterns': interaction_patterns,
            'role_suggestions': role_suggestions
        }
        
    async def extract_individual_traits(self, results):
        """提取个人特征"""
        traits = {}
        for user_id, answers in results.items():
            traits[user_id] = await self.analyze_individual_answers(answers)
        return traits
        
    async def analyze_group_dynamics(self, individual_traits):
        """分析团队动态"""
        return await self.model.generate(
            prompt=self.build_group_dynamics_prompt(individual_traits),
            temperature=0.7
        )
        
    async def analyze_interaction_patterns(self, results, traits):
        """分析互动倾向"""
        return await self.model.generate(
            prompt=self.build_interaction_patterns_prompt(results, traits),
            temperature=0.7
        )
        
    async def generate_role_suggestions(self, traits, dynamics, patterns):
        """生成角色匹配建议"""
        return await self.model.generate(
            prompt=self.build_role_suggestions_prompt(
                traits,
                dynamics,
                patterns
            ),
            temperature=0.7
        )

### 2.4 通讯系统
```python
class ChatSystem:
    def __init__(self):
        self.voice_chat = VoiceChatSystem()
        self.text_chat = TextChatSystem()
        self.message_handler = MessageHandler()
        
    async def initialize(self, room):
        """初始化聊天系统"""
        # 1. 创建语音房间
        await self.voice_chat.create_room(room.room_code)
        
        # 2. 创建文字聊天室
        await self.text_chat.create_room(room.room_code)
        
        # 3. 初始化消息处理器
        await self.message_handler.initialize(room)
        
    async def handle_message(self, room, user_id, message):
        """处理消息"""
        # 1. 消息预处理
        processed_message = await self.message_handler.preprocess(
            message,
            user_id
        )
        
        # 2. 消息分发
        if message.type == 'voice':
            await self.voice_chat.handle_message(room.room_code, processed_message)
        else:
            await self.text_chat.handle_message(room.room_code, processed_message)
            
        # 3. 消息存储
        await self.message_handler.store_message(processed_message)
        
    async def broadcast_message(self, room, message):
        """广播消息"""
        if message.type == 'voice':
            await self.voice_chat.broadcast(room.room_code, message)
        else:
            await self.text_chat.broadcast(room.room_code, message)

class VoiceChatSystem:
    def __init__(self):
        self.agora_client = AgoraClient()
        self.voice_processor = VoiceProcessor()
        
    async def create_room(self, room_code):
        """创建语音房间"""
        return await self.agora_client.create_channel({
            'channel_name': room_code,
            'voice_config': self.get_voice_config()
        })
        
    async def handle_message(self, room_code, message):
        """处理语音消息"""
        # 1. 音频处理
        processed_audio = await self.voice_processor.process(message.audio)
        
        # 2. 发送音频
        await self.agora_client.send_audio(room_code, processed_audio)
        
    async def broadcast(self, room_code, message):
        """广播语音消息"""
        await self.agora_client.broadcast_audio(room_code, message.audio)

class TextChatSystem:
    def __init__(self):
        self.websocket_manager = WebSocketManager()
        self.message_formatter = MessageFormatter()
        
    async def create_room(self, room_code):
        """创建文字聊天室"""
        return await self.websocket_manager.create_room(room_code)
        
    async def handle_message(self, room_code, message):
        """处理文字消息"""
        # 1. 消息格式化
        formatted_message = await self.message_formatter.format(message)
        
        # 2. 发送消息
        await self.websocket_manager.send_message(room_code, formatted_message)
        
    async def broadcast(self, room_code, message):
        """广播文字消息"""
        await self.websocket_manager.broadcast_message(room_code, message)

class MessageHandler:
    def __init__(self):
        self.message_validator = MessageValidator()
        self.content_filter = ContentFilter()
        self.message_store = MessageStore()
        
    async def initialize(self, room):
        """初始化消息处理器"""
        await self.message_store.initialize(room.room_code)
        
    async def preprocess(self, message, user_id):
        """消息预处理"""
        # 1. 消息验证
        if not await self.message_validator.validate(message):
            raise InvalidMessageError()
            
        # 2. 内容过滤
        filtered_content = await self.content_filter.filter(message.content)
        
        # 3. 添加元数据
        return {
            **message,
            'content': filtered_content,
            'user_id': user_id,
            'timestamp': datetime.now()
        }
        
    async def store_message(self, message):
        """存储消息"""
        await self.message_store.store(message)
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

class VoiceChatSystem:
    def __init__(self):
        self.agora_client = AgoraClient()
        self.matcher = UserMatcher()
        self.analyzer = BehaviorAnalyzer()
    
    async def create_random_room(self, user_profile):
        """创建随机聊天室"""
        # 1. 分析用户画像
        user_vector = await self.matcher.get_user_vector(user_profile)
        
        # 2. 匹配相似用户
        matched_users = await self.matcher.find_similar_users(user_vector)
        
        # 3. 创建语音房间
        room = await self.agora_client.create_room({
            'users': matched_users,
            'quality_config': self.get_quality_config(),
            'monitor_config': self.get_monitor_config()
        })
        
        # 4. 启动行为分析
        self.analyzer.start_monitoring(room.id)
        
        return room

class QuestionnaireSystem:
    def __init__(self):
        self.question_generator = QuestionGenerator()
        self.profile_analyzer = ProfileAnalyzer()
        self.result_analyzer = ResultAnalyzer()
    
    async def generate_questionnaire(self, user_profile):
        """生成个性化问卷"""
        # 1. 分析用户特征
        user_traits = await self.profile_analyzer.analyze(user_profile)
        
        # 2. 生成适配问题
        questions = await self.question_generator.generate({
            'user_traits': user_traits,
            'difficulty': self.calculate_difficulty(user_traits),
            'focus_areas': self.identify_focus_areas(user_traits)
        })
        
        # 3. 优化问题顺序
        optimized_questions = self.optimize_question_order(questions)
        
        return {
            'questions': optimized_questions,
            'adaptive_logic': self.create_adaptive_logic(optimized_questions)
        } 
