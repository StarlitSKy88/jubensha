"""添加角色和权限表.

Revision ID: 002
Revises: 001
Create Date: 2024-03-21 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # 创建权限表
    op.create_table(
        'permissions',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('name', sa.String(50), unique=True, nullable=False),
        sa.Column('description', sa.String(200), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    
    # 创建角色表
    op.create_table(
        'roles',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('name', sa.String(50), unique=True, nullable=False),
        sa.Column('description', sa.String(200), nullable=True),
        sa.Column('is_system', sa.Boolean(), nullable=False, default=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    
    # 创建角色-权限关联表
    op.create_table(
        'role_permissions',
        sa.Column('role_id', sa.String(36), sa.ForeignKey('roles.id', ondelete='CASCADE')),
        sa.Column('permission_id', sa.String(36), sa.ForeignKey('permissions.id', ondelete='CASCADE')),
    )
    
    # 创建用户-角色关联表
    op.create_table(
        'user_roles',
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='CASCADE')),
        sa.Column('role_id', sa.String(36), sa.ForeignKey('roles.id', ondelete='CASCADE')),
    )
    
    # 添加超级用户标志
    op.add_column('users', sa.Column('is_superuser', sa.Boolean(), nullable=False, server_default='false'))
    
    # 创建索引
    op.create_index('ix_permissions_name', 'permissions', ['name'])
    op.create_index('ix_roles_name', 'roles', ['name'])
    op.create_index('ix_role_permissions_role_id', 'role_permissions', ['role_id'])
    op.create_index('ix_role_permissions_permission_id', 'role_permissions', ['permission_id'])
    op.create_index('ix_user_roles_user_id', 'user_roles', ['user_id'])
    op.create_index('ix_user_roles_role_id', 'user_roles', ['role_id'])
    
    # 删除is_verified字段
    op.drop_column('users', 'is_verified')

def downgrade() -> None:
    # 删除索引
    op.drop_index('ix_user_roles_role_id')
    op.drop_index('ix_user_roles_user_id')
    op.drop_index('ix_role_permissions_permission_id')
    op.drop_index('ix_role_permissions_role_id')
    op.drop_index('ix_roles_name')
    op.drop_index('ix_permissions_name')
    
    # 删除超级用户标志
    op.drop_column('users', 'is_superuser')
    
    # 恢复is_verified字段
    op.add_column('users', sa.Column('is_verified', sa.Boolean(), nullable=False, server_default='false'))
    
    # 删除表
    op.drop_table('user_roles')
    op.drop_table('role_permissions')
    op.drop_table('roles')
    op.drop_table('permissions') 