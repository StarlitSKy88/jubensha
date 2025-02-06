import { describe, it, expect, beforeEach } from 'jest';
import { PermissionService } from '../../src/services/permission';
import { Permission, Role } from '../../src/interfaces/permission';

describe('PermissionService', () => {
  let permissionService: PermissionService;

  beforeEach(() => {
    permissionService = new PermissionService();
  });

  describe('checkPermission', () => {
    it('should return true for user with required permission', async () => {
      const userRole: Role = {
        id: '1',
        name: 'admin',
        permissions: ['read', 'write']
      };
      
      const result = await permissionService.checkPermission(userRole, 'read');
      expect(result).toBe(true);
    });

    it('should return false for user without required permission', async () => {
      const userRole: Role = {
        id: '2',
        name: 'viewer',
        permissions: ['read']
      };
      
      const result = await permissionService.checkPermission(userRole, 'write');
      expect(result).toBe(false);
    });
  });

  describe('assignPermission', () => {
    it('should successfully assign new permission to role', async () => {
      const userRole: Role = {
        id: '3',
        name: 'editor',
        permissions: ['read']
      };
      
      await permissionService.assignPermission(userRole, 'write');
      expect(userRole.permissions).toContain('write');
    });
  });
}); 