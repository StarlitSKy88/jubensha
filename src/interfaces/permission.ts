export interface Permission {
  id: string;
  name: string;
  description?: string;
  resource: string;
  action: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
}

export interface PermissionCheck {
  role: Role;
  permission: string;
  resource: string;
} 