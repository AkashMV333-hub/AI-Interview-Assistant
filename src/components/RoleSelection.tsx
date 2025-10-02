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
        background: '#f4f4f4',
        padding: '20px',
      }}
    >
      <div style={{ maxWidth: 1000, width: '100%' }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '38px',
          background: '#ffffff',
          padding: '20px 32px',
          border: '1px solid #e0e0e0',
          borderLeft: '4px solid #0000cc'
        }}>
          <Title level={1} style={{ color: '#161616', fontSize: '38px', marginBottom: '10px', fontWeight: '600' }}>
            AI Interview Assistant
          </Title>
          <Paragraph style={{ fontSize: '18px', color: '#525252', margin: 0 }}>
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
              border: '1px solid #e0e0e0',
              borderRadius: '0',
              cursor: 'pointer',
              transition: 'all 0.2s',
              padding: '24px',
              background: '#ffffff'
            }}
            onClick={() => navigate('/login/interviewee')}
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <UserOutlined style={{ fontSize: '80px', color: '#0000cc' }} />
              <Title level={2} style={{ marginBottom: 0, color: '#161616' }}>Interviewee</Title>
              <Paragraph style={{ fontSize: '16px', color: '#525252', minHeight: '60px' }}>
                Upload your resume and take an AI-powered technical interview to showcase your skills
              </Paragraph>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                background: '#0000cc',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '600',
                borderRadius: '0',
                marginTop: '8px'
              }}>
                Get Started <ArrowRightOutlined style={{ marginLeft: '8px' }} />
              </div>
            </Space>
          </Card>

          <Card
            hoverable
            style={{
              textAlign: 'center',
              border: '1px solid #e0e0e0',
              borderRadius: '0',
              cursor: 'pointer',
              transition: 'all 0.2s',
              padding: '24px',
              background: '#ffffff'
            }}
            onClick={() => navigate('/login/interviewer')}
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <TeamOutlined style={{ fontSize: '80px', color: '#0000cc' }} />
              <Title level={2} style={{ marginBottom: 0, color: '#161616' }}>Interviewer</Title>
              <Paragraph style={{ fontSize: '16px', color: '#525252', minHeight: '60px' }}>
                View and manage all candidates, review interview results, and track performance
              </Paragraph>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                background: '#0000cc',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '600',
                borderRadius: '0',
                marginTop: '8px'
              }}>
                Get Started <ArrowRightOutlined style={{ marginLeft: '8px' }} />
              </div>
            </Space>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
