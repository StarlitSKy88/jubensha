import { z } from 'zod';
import { UserModel, RoleModel, PermissionModel, Role, Permission } from '@models/auth';
import { AuthError } from '@errors/auth.error';

// 权限验证Schema
const permissionSchema = z.object({
  resource: z.string(),
  action: z.enum(['create', 'read', 'update', 'delete']),
  conditions: z.record(z.any()).optional()
});

export class PermissionService {
  // 检查用户是否有特定权限
  async checkPermission(userId: string, resource: string, action: string): Promise<boolean> {
    try {
      // 验证参数
      const validatedData = permissionSchema.parse({ resource, action });
      
      // 获取用户及其角色
      const user = await UserModel.findById(userId).populate('roles');
      if (!user) {
        throw new AuthError('User not found', 404);
      }

      // 获取角色的所有权限
      const permissions = await this.getRolePermissions(user.roles);
      
      // 检查是否有所需权限
      return this.hasPermission(permissions, validatedData.resource, validatedData.action);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new AuthError('Invalid permission parameters', 400);
      }
      throw error;
    }
  }

  // 获取角色的所有权限
  private async getRolePermissions(roles: Role[]): Promise<Permission[]> {
    const permissions: Permission[] = [];
    
    for (const role of roles) {
      const rolePermissions = await PermissionModel.find({ roleId: role._id });
      permissions.push(...rolePermissions);
    }

    return permissions;
  }

  // 检查权限列表中是否包含所需权限
  private hasPermission(permissions: Permission[], resource: string, action: string): boolean {
    return permissions.some(permission => 
      permission.resource === resource && 
      permission.actions.includes(action)
    );
  }

  // 为角色添加权限
  async addPermissionToRole(roleId: string, resource: string, action: string): Promise<void> {
    try {
      // 验证参数
      const validatedData = permissionSchema.parse({ resource, action });

      // 检查角色是否存在
      const role = await RoleModel.findById(roleId);
      if (!role) {
        throw new AuthError('Role not found', 404);
      }

      // 创建或更新权限
      await PermissionModel.findOneAndUpdate(
        { roleId, resource: validatedData.resource },
        { $addToSet: { actions: validatedData.action } },
        { upsert: true }
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new AuthError('Invalid permission parameters', 400);
      }
      throw error;
    }
  }

  // 从角色移除权限
  async removePermissionFromRole(roleId: string, resource: string, action: string): Promise<void> {
    try {
      // 验证参数
      const validatedData = permissionSchema.parse({ resource, action });

      // 更新权限
      await PermissionModel.findOneAndUpdate(
        { roleId, resource: validatedData.resource },
        { $pull: { actions: validatedData.action } }
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new AuthError('Invalid permission parameters', 400);
      }
      throw error;
    }
  }
} 