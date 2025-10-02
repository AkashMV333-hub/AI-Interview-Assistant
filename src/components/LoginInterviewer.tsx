import { useState } from 'react';
import { Card, Form, Input, Button, Typography, Space, App } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { login } from '../store/slices/authSlice';
import { authAPI } from '../services/api';
import Cookies from 'js-cookie';

const { Title, Paragraph, Text } = Typography;

const LoginInterviewer = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { message } = App.useApp();

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);

    try {
      const response = await authAPI.login({
        email: values.email,
        password: values.password,
        role: 'interviewer',
      });

      // Store token in cookie
      Cookies.set('auth_token', response.token, { expires: 1 });

      // Update Redux state
      dispatch(login({
        role: 'interviewer',
        email: response.user.email,
        name: response.user.name,
      }));

      message.success('Login successful!');

      setTimeout(() => {
        navigate('/interviewer/rooms');
        setLoading(false);
      }, 500);
    } catch (error: any) {
      message.error(error.message || 'Invalid credentials');
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
        padding: '20px',
      }}
    >
      <Card
        style={{
          maxWidth: 500,
          width: '100%',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <Title level={2}>Interviewer Sign In</Title>
            <Paragraph style={{ fontSize: '14px', color: '#666' }}>
              Welcome back! Please sign in to continue
            </Paragraph>
          </div>

          <Form
            name="login"
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
            requiredMark={false}
          >
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email' },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Enter your email"
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: 'Please enter your password' },
                { min: 6, message: 'Password must be at least 6 characters' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter your password"
                size="large"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
                style={{ background: '#52c41a', borderColor: '#52c41a' }}
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: 'center' }}>
            <Text>Don't have an account? </Text>
            <Link to="/signup/interviewer">Sign Up</Link>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default LoginInterviewer;
