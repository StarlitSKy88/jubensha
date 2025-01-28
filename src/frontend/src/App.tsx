import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectToken } from './store/slices/authSlice';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import GameLobby from './pages/lobby/GameLobby';
import VoiceRoom from './pages/room/VoiceRoom';
import QuestionnaireForm from './pages/questionnaire/QuestionnaireForm';
import HostConsole from './pages/host/HostConsole';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requireAuth = true }) => {
  const token = useSelector(selectToken);
  const isAuthenticated = !!token;

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/lobby" replace />} />
      <Route
        path="/login"
        element={
          <AuthGuard requireAuth={false}>
            <Login />
          </AuthGuard>
        }
      />
      <Route
        path="/register"
        element={
          <AuthGuard requireAuth={false}>
            <Register />
          </AuthGuard>
        }
      />
      <Route
        path="/lobby"
        element={
          <AuthGuard>
            <GameLobby />
          </AuthGuard>
        }
      />
      <Route
        path="/room/:roomId"
        element={
          <AuthGuard>
            <VoiceRoom />
          </AuthGuard>
        }
      />
      <Route
        path="/questionnaire"
        element={
          <AuthGuard>
            <QuestionnaireForm />
          </AuthGuard>
        }
      />
      <Route
        path="/host/:gameId"
        element={
          <AuthGuard>
            <HostConsole />
          </AuthGuard>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;

