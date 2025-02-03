import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import MainLayout from './layouts/MainLayout';
import Create from './pages/script/Create';

const App: React.FC = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/script/create" replace />} />
            <Route path="script">
              <Route path="create" element={<Create />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </ConfigProvider>
  );
};

export default App; 