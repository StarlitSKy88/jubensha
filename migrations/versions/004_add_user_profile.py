"""添加用户资料表.

Revision ID: 004
Revises: 003
Create Date: 2024-03-21 16:30:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '004'
down_revision = '003'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # 创建用户资料表
    op.create_table(
        'user_profiles',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False),
        sa.Column('avatar_url', sa.String(255), nullable=True),
        sa.Column('nickname', sa.String(50), nullable=True),
        sa.Column('bio', sa.String(500), nullable=True),
        sa.Column('location', sa.String(100), nullable=True),
        sa.Column('website', sa.String(200), nullable=True),
        sa.Column('gender', sa.String(10), nullable=True),
        sa.Column('birthday', sa.Date, nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    
    # 创建用户设置表
    op.create_table(
        'user_settings',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False),
        sa.Column('language', sa.String(10), server_default='zh-CN', nullable=False),
        sa.Column('timezone', sa.String(50), server_default='Asia/Shanghai', nullable=False),
        sa.Column('notification_email', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('notification_web', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('theme', sa.String(20), server_default='light', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    
    # 创建索引
    op.create_index('ix_user_profiles_user_id', 'user_profiles', ['user_id'])
    op.create_index('ix_user_settings_user_id', 'user_settings', ['user_id'])

def downgrade() -> None:
    # 删除索引
    op.drop_index('ix_user_settings_user_id')
    op.drop_index('ix_user_profiles_user_id')
    
    # 删除表
    op.drop_table('user_settings')
    op.drop_table('user_profiles') 