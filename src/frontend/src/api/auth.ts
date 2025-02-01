import request from './request';

interface LoginParams {
  username: string;
  password: string;
}

interface RegisterParams extends LoginParams {
  email: string;
}

interface UserResponse {
  id: string;
  username: string;
  email: string;
  role: string;
  token: string;
}

export const login = (data: LoginParams) => {
  return request.post<UserResponse>('/api/auth/login', data);
};

export const register = (data: RegisterParams) => {
  return request.post<UserResponse>('/api/auth/register', data);
};

export const logout = () => {
  return request.post('/api/auth/logout');
};

export const getCurrentUser = () => {
  return request.get<UserResponse>('/api/auth/me');
}; 