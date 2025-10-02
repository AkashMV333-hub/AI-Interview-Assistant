import { useState, useEffect } from 'react';
import { Card, Input, Button, Typography, Space, App } from 'antd';
import { LoginOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { addCandidateToRoom } from '../store/slices/interviewRoomsSlice';
import { roomRegistry } from '../utils/roomRegistry';

const { Title, Paragraph, Text } = Typography;

const JoinInterviewRoom = () => {
  const { roomCode: urlRoomCode } = useParams();
  const [roomCode, setRoomCode] = useState(urlRoomCode || '');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { message } = App.useApp();
  const { isAuthenticated, role } = useAppSelector((state) => state.auth);
  const rooms = useAppSelector((state) => state.interviewRooms.rooms);
  const interviewRoomsState = useAppSelector((state) => state.interviewRooms);
  const currentUser = useAppSelector((state) =>
    state.users.users.find(u => u.email === state.auth.userEmail)
  );

  // Debug: Log state on mount
  useEffect(() => {
    console.log('JoinInterviewRoom - Full interviewRooms state:', interviewRoomsState);
    console.log('JoinInterviewRoom - Rooms array:', rooms);
  }, [interviewRoomsState, rooms]);

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

  const handleJoinRoom = () => {
    if (!roomCode.trim()) {
      message.warning('Please enter a room code');
      return;
    }

    setLoading(true);

    console.log('Searching for room:', roomCode.toUpperCase());
    console.log('Available rooms in Redux:', rooms);

    // Check global registry (simulating backend lookup)
    const globalRoom = roomRegistry.findRoom(roomCode);
    console.log('Found room in global registry:', globalRoom);

    if (!globalRoom) {
      message.error(`Invalid room code: ${roomCode}. Please check and try again.`);
      console.log('Room not found in global registry');
      console.log('All rooms in registry:', roomRegistry.getAllRooms());
      setLoading(false);
      return;
    }

    if (currentUser) {
      console.log('Adding candidate to room:', currentUser.userId);
      // Add candidate to room
      dispatch(addCandidateToRoom({ roomCode: globalRoom.roomCode, candidateId: currentUser.userId }));
      message.success(`Joined "${globalRoom.title}" successfully!`);

      // Navigate to interview
      setTimeout(() => {
        navigate('/interviewee');
        setLoading(false);
      }, 500);
    } else {
      message.error('User not found. Please login again.');
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
