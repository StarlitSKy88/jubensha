export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  role?: 'user' | 'admin';
}

export interface LoginUserDto {
  email: string;
  password: string;
}

export interface UpdateUserDto {
  username?: string;
  email?: string;
  password?: string;
  isActive?: boolean;
} 