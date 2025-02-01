import React from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '@/store/slices/userSlice';
import styles from './Login.module.css';

interface LoginForm {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onFinish = async (values: LoginForm) => {
    try {
      // TODO: 实现登录API调用
      console.log('登录信息:', values);
      
      // 模拟登录成功
      dispatch(setUser({
        id: '1',
        username: values.username,
        role: 'user',
      }));
      
      message.success('登录成功');
      navigate('/workspace');
    } catch (error) {
      message.error('登录失败，请重试');
    }
  };

  return (
    <div className={styles.container}>
      <Card title="登录" className={styles.card}>
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              登录
            </Button>
          </Form.Item>

          <Form.Item>
            <Button type="link" onClick={() => navigate('/auth/register')} block>
              还没有账号？立即注册
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login; 