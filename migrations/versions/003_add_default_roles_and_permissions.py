"""添加默认角色和权限.

Revision ID: 003
Revises: 002
Create Date: 2024-03-21 13:00:00.000000

"""
from uuid import uuid4
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import table, column

# revision identifiers, used by Alembic.
revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None

# 定义表结构
permissions_table = table(
    'permissions',
    column('id', sa.String(36)),
    column('name', sa.String(50)),
    column('description', sa.String(200))
)

roles_table = table(
    'roles',
    column('id', sa.String(36)),
    column('name', sa.String(50)),
    column('description', sa.String(200)),
    column('is_system', sa.Boolean)
)

role_permissions_table = table(
    'role_permissions',
    column('role_id', sa.String(36)),
    column('permission_id', sa.String(36))
)

def upgrade() -> None:
    # 创建默认权限
    default_permissions = [
        {
            'id': str(uuid4()),
            'name': 'user:read',
            'description': '查看用户信息'
        },
        {
            'id': str(uuid4()),
            'name': 'user:write',
            'description': '修改用户信息'
        },
        {
            'id': str(uuid4()),
            'name': 'role:read',
            'description': '查看角色信息'
        },
        {
            'id': str(uuid4()),
            'name': 'role:write',
            'description': '修改角色信息'
        },
        {
            'id': str(uuid4()),
            'name': 'permission:read',
            'description': '查看权限信息'
        },
        {
            'id': str(uuid4()),
            'name': 'permission:write',
            'description': '修改权限信息'
        }
    ]
    
    op.bulk_insert(permissions_table, default_permissions)
    
    # 创建默认角色
    admin_role_id = str(uuid4())
    user_role_id = str(uuid4())
    
    default_roles = [
        {
            'id': admin_role_id,
            'name': 'admin',
            'description': '管理员',
            'is_system': True
        },
        {
            'id': user_role_id,
            'name': 'user',
            'description': '普通用户',
            'is_system': True
        }
    ]
    
    op.bulk_insert(roles_table, default_roles)
    
    # 分配权限给角色
    role_permissions = []
    
    # 管理员拥有所有权限
    for permission in default_permissions:
        role_permissions.append({
            'role_id': admin_role_id,
            'permission_id': permission['id']
        })
    
    # 普通用户只有读取权限
    for permission in default_permissions:
        if permission['name'].endswith(':read'):
            role_permissions.append({
                'role_id': user_role_id,
                'permission_id': permission['id']
            })
    
    op.bulk_insert(role_permissions_table, role_permissions)

def downgrade() -> None:
    # 删除默认角色的权限
    op.execute(
        role_permissions_table.delete().where(
            role_permissions_table.c.role_id.in_([
                r.id for r in roles_table.select().where(
                    roles_table.c.is_system == True
                )
            ])
        )
    )
    
    # 删除系统角色
    op.execute(
        roles_table.delete().where(roles_table.c.is_system == True)
    )
    
    # 删除所有默认权限
    op.execute(
        permissions_table.delete().where(
            permissions_table.c.name.in_([
                'user:read', 'user:write',
                'role:read', 'role:write',
                'permission:read', 'permission:write'
            ])
        )
    ) 