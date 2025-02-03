export interface User {
  id: string;
  username: string;
  email: string;
  name?: string;
  avatar?: string;
  role: 'admin' | 'user' | 'guest';
  permissions: string[];
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: Date;
  metadata: {
    loginCount: number;
    failedLoginAttempts: number;
    lastFailedLogin?: Date;
    passwordChangedAt?: Date;
  };
  settings: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    notifications: boolean;
    twoFactorEnabled: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginParams {
  email: string;
  password: string;
}

export interface RegisterParams extends LoginParams {
  username: string;
  role?: 'user' | 'guest';
}

export interface UpdateProfileParams {
  username?: string;
  email?: string;
  name?: string;
  avatar?: string;
  settings?: {
    theme?: 'light' | 'dark' | 'system';
    language?: string;
    notifications?: boolean;
    twoFactorEnabled?: boolean;
  };
}

export interface ChangePasswordParams {
  oldPassword: string;
  newPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export type RuleType = 'string' | 'number' | 'boolean' | 'method' | 'regexp' | 'integer' | 'float' | 'array' | 'object' | 'enum' | 'date' | 'url' | 'hex' | 'email'; 