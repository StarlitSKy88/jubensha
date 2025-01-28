import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectAuth } from '../../store/slices/authSlice';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requireAuth = true }) => {
  const { token, loading } = useSelector(selectAuth);
  const location = useLocation();

  // 如果正在加载，显示加载状态
  if (loading) {
    return <div>加载中...</div>;
  }

  // 需要认证但未登录，重定向到登录页
  if (requireAuth && !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 已登录但访问登录/注册页，重定向到首页
  if (!requireAuth && token) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard; 