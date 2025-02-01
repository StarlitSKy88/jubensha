import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import { useSelector } from 'react-redux';
import MainLayout from '@/components/layout/MainLayout';
import Login from '@/pages/auth/Login';
import Workspace from '@/pages/workspace';
import { RootState } from '@/store';

const App: React.FC = () => {
  const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Routes>
        <Route
          path="/auth/login"
          element={!isAuthenticated ? <Login /> : <Navigate to="/workspace" replace />}
        />
        <Route
          path="/"
          element={isAuthenticated ? <MainLayout /> : <Navigate to="/auth/login" replace />}
        >
          <Route index element={<Navigate to="/workspace" replace />} />
          <Route path="workspace" element={<Workspace />} />
          {/* 其他受保护的路由将在这里添加 */}
        </Route>
      </Routes>
    </Layout>
  );
};

export default App; 
