import { Permission, Role } from '../interfaces/permission';

export class PermissionService {
  async checkPermission(role: Role, requiredPermission: string): Promise<boolean> {
    return role.permissions.includes(requiredPermission);
  }

  async assignPermission(role: Role, permission: string): Promise<void> {
    if (!role.permissions.includes(permission)) {
      role.permissions.push(permission);
    }
  }

  async removePermission(role: Role, permission: string): Promise<void> {
    const index = role.permissions.indexOf(permission);
    if (index > -1) {
      role.permissions.splice(index, 1);
    }
  }

  async getRolePermissions(role: Role): Promise<string[]> {
    return [...role.permissions];
  }
} 