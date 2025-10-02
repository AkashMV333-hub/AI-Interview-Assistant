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
            <Title level={2} style={{ color: '#161616', marginBottom: '8px' }}>Create Interviewer Account</Title>
            <Paragraph style={{ fontSize: '14px', color: '#525252', margin: 0 }}>
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
              label={<span style={{ color: '#161616', fontWeight: '600' }}>Full Name</span>}
              name="name"
              rules={[{ required: true, message: 'Please enter your name' }]}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#525252' }} />}
                placeholder="Enter your full name"
                size="large"
                style={{
                  borderRadius: '0',
                  border: '1px solid #e0e0e0'
                }}
              />
            </Form.Item>

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

            <Form.Item
              label={<span style={{ color: '#161616', fontWeight: '600' }}>Confirm Password</span>}
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
                prefix={<LockOutlined style={{ color: '#525252' }} />}
                placeholder="Confirm your password"
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
                Create Account
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: 'center', paddingTop: '16px', borderTop: '1px solid #e0e0e0' }}>
            <Text style={{ color: '#525252' }}>Already have an account? </Text>
            <Link to="/login/interviewer" style={{ color: '#0f62fe', fontWeight: '600' }}>Sign In</Link>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default SignupInterviewer;
