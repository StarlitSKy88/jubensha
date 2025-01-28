import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthGuard from '../components/guards/AuthGuard';

// 页面组件
import Login from '../components/Login';
import Register from '../components/Register';
import GameLobby from '../components/GameLobby';
import VoiceRoom from '../components/VoiceRoom';
import QuestionnaireForm from '../components/QuestionnaireForm';
import HostConsole from '../components/HostConsole';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* 公共路由 */}
      <Route path="/login" element={
        <AuthGuard requireAuth={false}>
          <Login />
        </AuthGuard>
      } />
      <Route path="/register" element={
        <AuthGuard requireAuth={false}>
          <Register />
        </AuthGuard>
      } />

      {/* 需要认证的路由 */}
      <Route path="/" element={
        <AuthGuard>
          <GameLobby />
        </AuthGuard>
      } />
      <Route path="/room/:roomId" element={
        <AuthGuard>
          <VoiceRoom />
        </AuthGuard>
      } />
      <Route path="/questionnaire" element={
        <AuthGuard>
          <QuestionnaireForm />
        </AuthGuard>
      } />
      <Route path="/host/:roomId" element={
        <AuthGuard>
          <HostConsole />
        </AuthGuard>
      } />

      {/* 404页面 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes; 