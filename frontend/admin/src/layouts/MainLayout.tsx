import React from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, MenuProps } from 'antd';
import {
  FileTextOutlined,
  TeamOutlined,
  BranchesOutlined,
  FileSearchOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems: MenuItem[] = [
    {
      key: '/script',
      icon: <FileTextOutlined />,
      label: '剧本创作',
      children: [
        {
          key: '/script/create',
          label: '创建剧本',
        },
        {
          key: '/script/drafts',
          label: '草稿箱',
        },
      ],
    },
    {
      key: '/characters',
      icon: <TeamOutlined />,
      label: '人物管理',
    },
    {
      key: '/clues',
      icon: <FileSearchOutlined />,
      label: '线索系统',
    },
    {
      key: '/plot',
      icon: <BranchesOutlined />,
      label: '剧情编排',
    },
    {
      key: '/history',
      icon: <HistoryOutlined />,
      label: '创作历史',
    },
  ];

  const userMenu: MenuItem[] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人信息',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '偏好设置',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ padding: '0 24px', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
          剧本杀创作助手
        </div>
        <Dropdown menu={{ items: userMenu }} placement="bottomRight">
          <Button type="text" icon={<Avatar icon={<UserOutlined />} />} />
        </Dropdown>
      </Header>
      <Layout>
        <Sider width={200} style={{ background: '#fff' }}>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            defaultOpenKeys={['/script']}
            style={{ height: '100%', borderRight: 0 }}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
          />
        </Sider>
        <Layout style={{ padding: '24px' }}>
          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
              background: '#fff',
              borderRadius: '4px',
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default MainLayout; 