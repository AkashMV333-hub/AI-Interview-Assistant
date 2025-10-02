import { Card, Typography, Space } from 'antd';
import { UserOutlined, TeamOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAppSelector } from '../store/hooks';

const { Title, Paragraph } = Typography;

const RoleSelection = () => {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && role) {
      if (role === 'interviewee') {
        navigate('/join-room');
      } else if (role === 'interviewer') {
        navigate('/interviewer/rooms');
      }
    }
  }, [isAuthenticated, role, navigate]);

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
      <div style={{ maxWidth: 1000, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <Title level={1} style={{ color: 'white', fontSize: '48px', marginBottom: '16px' }}>
            AI Interview Assistant
          </Title>
          <Paragraph style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)' }}>
            Choose your role to get started
          </Paragraph>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '32px',
          }}
        >
          <Card
            hoverable
            style={{
              textAlign: 'center',
              border: 'none',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              cursor: 'pointer',
              transition: 'all 0.3s',
              padding: '24px',
            }}
            onClick={() => navigate('/login/interviewee')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 12px 48px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.2)';
            }}
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <UserOutlined style={{ fontSize: '80px', color: '#1890ff' }} />
              <Title level={2} style={{ marginBottom: 0 }}>Interviewee</Title>
              <Paragraph style={{ fontSize: '16px', color: '#666', minHeight: '60px' }}>
                Upload your resume and take an AI-powered technical interview to showcase your skills
              </Paragraph>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1890ff', fontSize: '18px', fontWeight: 500 }}>
                Let's Start <ArrowRightOutlined style={{ marginLeft: '8px' }} />
              </div>
            </Space>
          </Card>

          <Card
            hoverable
            style={{
              textAlign: 'center',
              border: 'none',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              cursor: 'pointer',
              transition: 'all 0.3s',
              padding: '24px',
            }}
            onClick={() => navigate('/login/interviewer')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 12px 48px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.2)';
            }}
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <TeamOutlined style={{ fontSize: '80px', color: '#52c41a' }} />
              <Title level={2} style={{ marginBottom: 0 }}>Interviewer</Title>
              <Paragraph style={{ fontSize: '16px', color: '#666', minHeight: '60px' }}>
                View and manage all candidates, review interview results, and track performance
              </Paragraph>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#52c41a', fontSize: '18px', fontWeight: 500 }}>
                Let's Start <ArrowRightOutlined style={{ marginLeft: '8px' }} />
              </div>
            </Space>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
