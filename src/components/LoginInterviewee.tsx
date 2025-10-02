import { useState } from 'react';
import { Card, Form, Input, Button, Typography, Space, App } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { login } from '../store/slices/authSlice';
import { authAPI } from '../services/api';
import Cookies from 'js-cookie';

const { Title, Paragraph, Text } = Typography;

const LoginInterviewee = () => {
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
        role: 'interviewee',
      });

      // Store token in cookie
      Cookies.set('auth_token', response.token, { expires: 1 });

      // Update Redux state
      dispatch(login({
        role: 'interviewee',
        email: response.user.email,
        name: response.user.name,
      }));

      message.success('Login successful!');

      setTimeout(() => {
        navigate('/join-room');
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
        background: '#f4f4f4',
        padding: '20px',
      }}
    >
      <Card
        style={{
          maxWidth: 500,
          width: '100%',
          borderRadius: '0',
          border: '1px solid #e0e0e0',
          boxShadow: 'none',
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{
            textAlign: 'center',
            padding: '24px 0 16px',
            borderBottom: '2px solid #0f62fe'
          }}>
            <Title level={2} style={{ color: '#161616', marginBottom: '8px' }}>Interviewee Sign In</Title>
            <Paragraph style={{ fontSize: '14px', color: '#525252', margin: 0 }}>
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
              label={<span style={{ color: '#161616', fontWeight: '600' }}>Email</span>}
              name="email"
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email' },
              ]}
            >
              <Input
                prefix={<MailOutlined style={{ color: '#525252' }} />}
                placeholder="Enter your email"
                size="large"
                style={{
                  borderRadius: '0',
                  border: '1px solid #e0e0e0'
                }}
              />
            </Form.Item>

            <Form.Item
              label={<span style={{ color: '#161616', fontWeight: '600' }}>Password</span>}
              name="password"
              rules={[
                { required: true, message: 'Please enter your password' },
                { min: 6, message: 'Password must be at least 6 characters' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#525252' }} />}
                placeholder="Enter your password"
                size="large"
                style={{
                  borderRadius: '0',
                  border: '1px solid #e0e0e0'
                }}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, marginTop: '32px' }}>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
                style={{
                  borderRadius: '0',
                  height: '48px',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: 'center', paddingTop: '16px', borderTop: '1px solid #e0e0e0' }}>
            <Text style={{ color: '#525252' }}>Don't have an account? </Text>
            <Link to="/signup/interviewee" style={{ color: '#0f62fe', fontWeight: '600' }}>Sign Up</Link>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default LoginInterviewee;
