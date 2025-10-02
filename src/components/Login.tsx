import { useState } from 'react';
import { Card, Form, Input, Button, Typography, Space, App } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { login } from '../store/slices/authSlice';
import { generateToken, setTokenCookie } from '../utils/jwtUtils';

const { Title, Paragraph, Text } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { message } = App.useApp();
  const users = useAppSelector((state) => state.users.users);

  const onFinish = (values: { email: string; password: string }) => {
    setLoading(true);

    // Find user by email
    const user = users.find((u) => u.email === values.email);

    if (!user) {
      message.error('Email not found. Please sign up first.');
      setLoading(false);
      return;
    }

    // Verify password
    if (user.password !== values.password) {
      message.error('Incorrect password. Please try again.');
      setLoading(false);
      return;
    }

    // Generate JWT token
    const token = generateToken(user.userId, user.email, user.role);
    setTokenCookie(token);

    // Login user
    dispatch(login({
      role: user.role,
      email: user.email,
      name: user.name,
    }));

    message.success('Login successful!');

    // Navigate based on role
    setTimeout(() => {
      if (user.role === 'interviewee') {
        navigate('/interviewee');
      } else {
        navigate('/interviewer');
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
            <Title level={2}>AI Interview Assistant</Title>
            <Paragraph style={{ fontSize: '14px', color: '#666' }}>
              Sign in to continue
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
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: 'center' }}>
            <Text>Don't have an account? </Text>
            <Link to="/signup">Sign Up</Link>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default Login;
