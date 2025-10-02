import { useState } from 'react';
import { Card, Form, Input, Button, Typography, Space, App } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { login } from '../store/slices/authSlice';
import { authAPI } from '../services/api';
import Cookies from 'js-cookie';

const { Title, Paragraph, Text } = Typography;

const SignupInterviewer = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { message } = App.useApp();

  const onFinish = async (values: { name: string; email: string; password: string }) => {
    setLoading(true);

    try {
      const response = await authAPI.signup({
        name: values.name,
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

      message.success('Account created successfully!');

      setTimeout(() => {
        navigate('/interviewer/rooms');
        setLoading(false);
      }, 500);
    } catch (error: any) {
      message.error(error.message || 'Failed to create account');
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
            <Title level={2}>Create Interviewer Account</Title>
            <Paragraph style={{ fontSize: '14px', color: '#666' }}>
              Sign up to access the interviewer dashboard
            </Paragraph>
          </div>

          <Form
            name="signup"
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
            requiredMark={false}
          >
            <Form.Item
              label="Full Name"
              name="name"
              rules={[{ required: true, message: 'Please enter your name' }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Enter your full name"
                size="large"
              />
            </Form.Item>

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

            <Form.Item
              label="Confirm Password"
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Please confirm your password' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Passwords do not match'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Confirm your password"
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
                Create Account
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: 'center' }}>
            <Text>Already have an account? </Text>
            <Link to="/login/interviewer">Sign In</Link>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default SignupInterviewer;
