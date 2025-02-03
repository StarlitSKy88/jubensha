import React, { useState } from 'react';
import { Card, List, Switch, Button, Modal, Input, message } from 'antd';
import { useAuthStore } from '@/stores/auth';
import { SecurityScanOutlined, BellOutlined, GlobalOutlined, DeleteOutlined } from '@ant-design/icons';

const Settings: React.FC = () => {
  const { user, updateProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [deleteAccountModal, setDeleteAccountModal] = useState(false);
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState('');

  const handleSettingChange = async (key: string, value: any) => {
    try {
      setLoading(true);
      await updateProfile({
        settings: {
          ...user?.settings,
          [key]: value
        }
      });
      message.success('设置已更新');
    } catch (error) {
      message.error('更新失败：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      // TODO: 实现账号删除逻辑
      message.success('账号已删除');
      setDeleteAccountModal(false);
    } catch (error) {
      message.error('删除失败：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  const securitySettings = [
    {
      title: '两步验证',
      description: '启用两步验证以提高账号安全性',
      icon: <SecurityScanOutlined />,
      value: user?.settings.twoFactorEnabled,
      onChange: (checked: boolean) => handleSettingChange('twoFactorEnabled', checked)
    }
  ];

  const notificationSettings = [
    {
      title: '系统通知',
      description: '接收系统更新、维护等重要通知',
      icon: <BellOutlined />,
      value: user?.settings.notifications,
      onChange: (checked: boolean) => handleSettingChange('notifications', checked)
    }
  ];

  const generalSettings = [
    {
      title: '语言设置',
      description: '选择您偏好的界面语言',
      icon: <GlobalOutlined />,
      value: user?.settings.language === 'zh-CN',
      onChange: (checked: boolean) => handleSettingChange('language', checked ? 'zh-CN' : 'en-US')
    }
  ];

  const renderSettingItem = (item: {
    title: string;
    description: string;
    icon: React.ReactNode;
    value: boolean;
    onChange: (checked: boolean) => void;
  }) => (
    <List.Item
      actions={[
        <Switch
          key="switch"
          checked={item.value}
          onChange={item.onChange}
          loading={loading}
        />
      ]}
    >
      <List.Item.Meta
        avatar={item.icon}
        title={item.title}
        description={item.description}
      />
    </List.Item>
  );

  return (
    <div className="p-6">
      <Card title="安全设置" className="mb-6">
        <List
          itemLayout="horizontal"
          dataSource={securitySettings}
          renderItem={renderSettingItem}
        />
      </Card>

      <Card title="通知设置" className="mb-6">
        <List
          itemLayout="horizontal"
          dataSource={notificationSettings}
          renderItem={renderSettingItem}
        />
      </Card>

      <Card title="常规设置" className="mb-6">
        <List
          itemLayout="horizontal"
          dataSource={generalSettings}
          renderItem={renderSettingItem}
        />
      </Card>

      <Card title="危险区域" className="mb-6">
        <div className="flex items-center justify-between p-4 bg-red-50 rounded">
          <div>
            <h4 className="text-red-600 font-medium">删除账号</h4>
            <p className="text-gray-600">
              删除账号后，所有数据将被永久删除且无法恢复
            </p>
          </div>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => setDeleteAccountModal(true)}
          >
            删除账号
          </Button>
        </div>
      </Card>

      <Modal
        title="删除账号确认"
        open={deleteAccountModal}
        onCancel={() => setDeleteAccountModal(false)}
        onOk={handleDeleteAccount}
        okText="确认删除"
        cancelText="取消"
        okButtonProps={{
          loading,
          danger: true
        }}
      >
        <p>请输入密码以确认删除账号：</p>
        <Input.Password
          value={deleteConfirmPassword}
          onChange={e => setDeleteConfirmPassword(e.target.value)}
          placeholder="请输入密码"
        />
        <p className="mt-4 text-red-600">
          警告：此操作不可逆，您的所有数据将被永久删除！
        </p>
      </Modal>
    </div>
  );
};

export default Settings; 