import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  DesktopOutlined,
  FileOutlined,
  UserOutlined,
  ExperimentOutlined,
} from '@ant-design/icons';

const { Header, Content, Footer, Sider } = Layout;

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    {
      key: 'workspace',
      icon: <DesktopOutlined />,
      label: '创作工作台',
    },
    {
      key: 'projects',
      icon: <FileOutlined />,
      label: '项目管理',
    },
    {
      key: 'test',
      icon: <ExperimentOutlined />,
      label: '测试中心',
    },
    {
      key: 'account',
      icon: <UserOutlined />,
      label: '个人中心',
    },
  ];

  const handleMenuClick = (key: string) => {
    navigate(`/${key}`);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)' }} />
        <Menu
          theme="dark"
          defaultSelectedKeys={['workspace']}
          mode="inline"
          items={menuItems}
          onClick={({ key }) => handleMenuClick(key)}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: '#fff' }} />
        <Content style={{ margin: '16px' }}>
          <div style={{ padding: 24, minHeight: 360, background: '#fff' }}>
            <Outlet />
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          剧本杀创作平台 ©{new Date().getFullYear()} Created by AI Team
        </Footer>
      </Layout>
    </Layout>
  );
};

export default MainLayout; 