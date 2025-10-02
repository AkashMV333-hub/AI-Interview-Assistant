import { useState, useEffect } from 'react';
import { Card, Input, Button, Typography, Space, App } from 'antd';
import { LoginOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setRoomCode as setInterviewRoomCode } from '../store/slices/interviewSlice';
import { roomsAPI } from '../services/api';

const { Title, Paragraph, Text } = Typography;

const JoinInterviewRoom = () => {
  const { roomCode: urlRoomCode } = useParams();
  const [roomCode, setRoomCode] = useState(urlRoomCode || '');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
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

      // Check if candidate already has an interview for this room
      if (response.existingCandidate) {
        if (response.existingCandidate.status === 'completed') {
          message.error('You have already completed this interview. You cannot retake it.');
          setLoading(false);
          return;
        } else if (response.existingCandidate.status === 'in-progress') {
          message.warning('Resuming your interview...');
        }
      } else {
        message.success(`Joined "${response.room.title}" successfully!`);
      }

      // Save room code to Redux for later use
      dispatch(setInterviewRoomCode(response.room.roomCode));

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
          maxWidth: 550,
          width: '100%',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          background: 'rgba(255,255,255,0.98)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{
            textAlign: 'center',
            padding: '24px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '12px',
            marginTop: '-24px',
            marginLeft: '-24px',
            marginRight: '-24px',
            marginBottom: '8px'
          }}>
            <Title level={2} style={{ color: 'white', margin: 0, marginBottom: '8px' }}>
              🚪 Join Interview Room
            </Title>
            <Paragraph style={{ color: 'rgba(255,255,255,0.9)', margin: 0, fontSize: '15px' }}>
              Enter the room code provided by your interviewer
            </Paragraph>
          </div>

          <div>
            <Text strong style={{ fontSize: '15px', color: '#333' }}>Room Code:</Text>
            <Input
              placeholder="Enter room code (e.g., INT-ABC123)"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              onPressEnter={handleJoinRoom}
              size="large"
              style={{
                marginTop: '10px',
                borderRadius: '10px',
                border: '2px solid #e0e0e0',
                fontSize: '16px',
                padding: '12px',
                fontWeight: 'bold',
                letterSpacing: '1px'
              }}
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
            style={{
              height: '52px',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
            }}
          >
            Join Interview Room
          </Button>

          <div style={{
            textAlign: 'center',
            padding: '12px',
            background: 'linear-gradient(to right, #f8f9fa, #e9ecef)',
            borderRadius: '8px'
          }}>
            <Text type="secondary" style={{ fontSize: '13px' }}>
              💡 Make sure you have the correct room code from your interviewer
            </Text>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default JoinInterviewRoom;
