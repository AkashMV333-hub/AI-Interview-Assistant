import { useState } from 'react';
import { Card, Form, Input, Button, Radio, Typography, Space, App } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { registerUser } from '../store/slices/usersSlice';
import { login } from '../store/slices/authSlice';
import { generateToken, setTokenCookie } from '../utils/jwtUtils';
import { v4 as uuidv4 } from 'uuid';
import type { UserRole } from '../store/slices/authSlice';

const { Title, Paragraph, Text } = Typography;

const Signup = () => {
  const [role, setRole] = useState<UserRole>('interviewee');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { message } = App.useApp();
  const users = useAppSelector((state) => state.users.users);

  const onFinish = (values: { name: string; email: string; password: string; confirmPassword: string }) => {
    setLoading(true);

    // Check if email already exists
    const existingUser = users.find((user) => user.email === values.email);
    if (existingUser) {
      message.error('Email already registered. Please login instead.');
      setLoading(false);
      return;
    }

    // Create new user with unique userId
    const userId = uuidv4();
    const newUser = {
      userId,
      name: values.name,
      email: values.email,
      password: values.password, // In production, hash this password
      role: role!,
      createdAt: Date.now(),
    };

    // Register user
    dispatch(registerUser(newUser));

    // Generate JWT token
    const token = generateToken(userId, values.email, role!);
    setTokenCookie(token);

    // Auto-login after signup
    dispatch(login({
      role: role!,
      email: values.email,
      name: values.name,
    }));

    message.success('Account created successfully!');

    // Navigate based on role
    setTimeout(() => {
      if (role === 'interviewee') {
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
            <Title level={2}>Create Account</Title>
            <Paragraph style={{ fontSize: '14px', color: '#666' }}>
              Sign up to get started
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
              label="Select Role"
              name="role"
              initialValue="interviewee"
            >
              <Radio.Group
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{ width: '100%' }}
                buttonStyle="solid"
              >
                <Radio.Button value="interviewee" style={{ width: '50%', textAlign: 'center' }}>
                  Interviewee
                </Radio.Button>
                <Radio.Button value="interviewer" style={{ width: '50%', textAlign: 'center' }}>
                  Interviewer
                </Radio.Button>
              </Radio.Group>
            </Form.Item>

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
              >
                Sign Up
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: 'center' }}>
            <Text>Already have an account? </Text>
            <Link to="/login">Sign In</Link>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default Signup;
