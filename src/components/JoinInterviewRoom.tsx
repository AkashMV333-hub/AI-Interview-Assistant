import { useState, useEffect } from 'react';
import { Card, Input, Button, Typography, Space, App } from 'antd';
import { LoginOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { roomsAPI } from '../services/api';

const { Title, Paragraph, Text } = Typography;

const JoinInterviewRoom = () => {
  const { roomCode: urlRoomCode } = useParams();
  const [roomCode, setRoomCode] = useState(urlRoomCode || '');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { isAuthenticated, role } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // If user is not authenticated, redirect to login
    if (!isAuthenticated) {
      message.warning('Please login first to join an interview');
      navigate('/login/interviewee');
      return;
    }

    // If user is not an interviewee, redirect
    if (role !== 'interviewee') {
      message.error('Only interviewees can join interview rooms');
      navigate('/');
      return;
    }

    // If room code from URL, auto-fill it
    if (urlRoomCode) {
      setRoomCode(urlRoomCode.toUpperCase());
    }
  }, [isAuthenticated, role, urlRoomCode, navigate, message]);

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) {
      message.warning('Please enter a room code');
      return;
    }

    setLoading(true);

    try {
      // Join room via backend API
      const response = await roomsAPI.joinRoom(roomCode.toUpperCase());
      message.success(`Joined "${response.room.title}" successfully!`);

      // Navigate to interview
      setTimeout(() => {
        navigate('/interviewee');
        setLoading(false);
      }, 500);
    } catch (error: any) {
      console.error('Error joining room:', error);
      message.error(error.message || 'Failed to join room. Please check the code and try again.');
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
            <Title level={2}>Join Interview Room</Title>
            <Paragraph style={{ fontSize: '14px', color: '#666' }}>
              Enter the room code provided by your interviewer
            </Paragraph>
          </div>

          <div>
            <Text strong>Room Code:</Text>
            <Input
              placeholder="Enter room code (e.g., INT-ABC123)"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              onPressEnter={handleJoinRoom}
              size="large"
              style={{ marginTop: '8px' }}
              maxLength={11}
            />
          </div>

          <Button
            type="primary"
            icon={<LoginOutlined />}
            size="large"
            block
            onClick={handleJoinRoom}
            loading={loading}
          >
            Join Interview Room
          </Button>

          <div style={{ textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Make sure you have the correct room code from your interviewer
            </Text>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default JoinInterviewRoom;
