-- Database schema for AI Education Platform

-- 创建扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Users table
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ
);

-- Courses table
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    instructor_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Learning materials table
CREATE TABLE learning_materials (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id),
    title VARCHAR(100) NOT NULL,
    content TEXT,
    material_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student progress table
CREATE TABLE student_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    course_id INTEGER REFERENCES courses(id),
    completion_status INTEGER DEFAULT 0,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI interaction history
CREATE TABLE ai_interactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    question TEXT NOT NULL,
    response TEXT NOT NULL,
    interaction_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assessment table
CREATE TABLE assessments (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id),
    title VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assessment results
CREATE TABLE assessment_results (
    id SERIAL PRIMARY KEY,
    assessment_id INTEGER REFERENCES assessments(id),
    user_id INTEGER REFERENCES users(id),
    score DECIMAL(5,2),
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 游戏会话表
CREATE TABLE game_sessions (
    session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_code VARCHAR(10) UNIQUE NOT NULL,
    host_id UUID REFERENCES users(user_id),
    script_id UUID NOT NULL,
    game_state JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    voice_channel_id VARCHAR(50),
    active_players JSONB NOT NULL DEFAULT '[]'
);

-- 玩家画像表
CREATE TABLE player_profiles (
    profile_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id),
    preferences JSONB NOT NULL DEFAULT '{}',
    play_history JSONB NOT NULL DEFAULT '[]',
    skill_ratings JSONB NOT NULL DEFAULT '{}',
    personality_tags TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 剧本模板表
CREATE TABLE script_templates (
    template_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    difficulty INTEGER NOT NULL,
    min_players INTEGER NOT NULL,
    max_players INTEGER NOT NULL,
    estimated_duration INTEGER NOT NULL,
    core_plot JSONB NOT NULL,
    role_templates JSONB NOT NULL,
    clue_graph JSONB NOT NULL,
    relationship_matrix JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 模板变体表
CREATE TABLE template_variants (
    variant_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES script_templates(template_id),
    player_count INTEGER NOT NULL,
    difficulty_level INTEGER NOT NULL,
    modified_roles JSONB NOT NULL,
    modified_clues JSONB NOT NULL,
    modified_relations JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 主持人资源表
CREATE TABLE hosting_resources (
    resource_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL,
    content_type VARCHAR(50) NOT NULL,
    content_url VARCHAR(255) NOT NULL,
    tags TEXT[] NOT NULL DEFAULT '{}',
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 游戏进度追踪表
CREATE TABLE game_progress (
    tracking_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES game_sessions(session_id),
    current_phase VARCHAR(50) NOT NULL,
    revealed_clues JSONB NOT NULL DEFAULT '[]',
    player_states JSONB NOT NULL DEFAULT '{}',
    host_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 问卷数据表
CREATE TABLE questionnaires (
    questionnaire_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id),
    session_id UUID REFERENCES game_sessions(session_id),
    responses JSONB NOT NULL,
    analysis_result JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_sessions_host ON game_sessions(host_id);
CREATE INDEX idx_profiles_user ON player_profiles(user_id);
CREATE INDEX idx_variants_template ON template_variants(template_id);
CREATE INDEX idx_progress_session ON game_progress(session_id);
CREATE INDEX idx_questionnaires_user ON questionnaires(user_id);
CREATE INDEX idx_questionnaires_session ON questionnaires(session_id);
