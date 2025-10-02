import { useState, useEffect } from 'react';
import { Card, Button, Typography, Space, Input, message as antMessage, Modal } from 'antd';
import { PlusOutlined, CopyOutlined, ShareAltOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { createRoom } from '../store/slices/interviewRoomsSlice';
import { roomRegistry } from '../utils/roomRegistry';
import { v4 as uuidv4 } from 'uuid';

const { Title, Text, Paragraph } = Typography;

const InterviewerRoomDashboard = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { userId, userName } = useAppSelector((state) => {
    const user = state.users.users.find(u => u.email === state.auth.userEmail);
    console.log('Current user:', { userId: user?.userId, userName: state.auth.userName });
    return { userId: user?.userId || '', userName: state.auth.userName };
  });
  const allRooms = useAppSelector((state) => state.interviewRooms.rooms);
  const rooms = useAppSelector((state) =>
    state.interviewRooms.rooms.filter(r => r.interviewerId === userId && r.isActive)
  );
  const [newRoomTitle, setNewRoomTitle] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Debug log
  useEffect(() => {
    console.log('All rooms in system:', allRooms);
    console.log('Filtered rooms for user:', rooms);
    console.log('Current userId:', userId);
  }, [allRooms, rooms, userId]);

  // Auto-create a default room if interviewer has none
  useEffect(() => {
    if (userId && allRooms.length === 0) {
      // Create a default room automatically
      const defaultRoomCode = generateRoomCode();
      const defaultRoom = {
        roomId: uuidv4(),
        roomCode: defaultRoomCode,
        interviewerId: userId,
        interviewerName: userName,
        title: 'My First Interview Room',
        candidateIds: [],
        createdAt: Date.now(),
        isActive: true,
      };
      console.log('Auto-creating default room:', defaultRoom);
      dispatch(createRoom(defaultRoom));
      antMessage.success(`Welcome! Your first room has been created with code: ${defaultRoomCode}`);
    } else if (rooms.length === 0 && allRooms.length > 0) {
      setShowCreateModal(true);
    }
  }, [userId]);

  const generateRoomCode = () => {
    return `INT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  };

  const handleCreateRoom = () => {
    if (!newRoomTitle.trim()) {
      antMessage.warning('Please enter a room title');
      return;
    }

    const roomCode = generateRoomCode();
    const newRoom = {
      roomId: uuidv4(),
      roomCode,
      interviewerId: userId,
      interviewerName: userName,
      title: newRoomTitle,
      candidateIds: [],
      createdAt: Date.now(),
      isActive: true,
    };

    console.log('Creating room:', newRoom);
    dispatch(createRoom(newRoom));

    // Register room in global registry (simulating backend)
    roomRegistry.registerRoom({
      roomCode,
      interviewerId: userId,
      interviewerName: userName,
      title: newRoomTitle,
      createdAt: Date.now(),
    });

    console.log('Room registered globally:', roomCode);

    // Verify room was created
    setTimeout(() => {
      console.log('All rooms after creation:', rooms);
      console.log('Global registry:', roomRegistry.getAllRooms());
    }, 100);

    antMessage.success(`Interview room created! Code: ${roomCode}`);
    setNewRoomTitle('');
    setShowCreateModal(false);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    antMessage.success(`${label} copied to clipboard!`);
  };

  const getJoinLink = (roomCode: string) => {
    return `${window.location.origin}/join/${roomCode}`;
  };

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={3}>Your Interview Rooms</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setShowCreateModal(true)}
        >
          Create New Room
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
        {rooms.map((room) => (
          <Card
            key={room.roomId}
            hoverable
            style={{ borderRadius: '8px' }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div>
                <Title level={4} style={{ marginBottom: '4px' }}>{room.title}</Title>
                <Text type="secondary">Created {new Date(room.createdAt).toLocaleDateString()}</Text>
              </div>

              <div style={{ background: '#f0f2f5', padding: '12px', borderRadius: '4px' }}>
                <Text strong>Room Code:</Text>
                <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
                  <Text code style={{ fontSize: '18px', marginRight: '8px' }}>{room.roomCode}</Text>
                  <Button
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => copyToClipboard(room.roomCode, 'Room code')}
                  />
                </div>
              </div>

              <div>
                <Text strong>Join Link:</Text>
                <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px', gap: '8px' }}>
                  <Input
                    value={getJoinLink(room.roomCode)}
                    readOnly
                    size="small"
                  />
                  <Button
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => copyToClipboard(getJoinLink(room.roomCode), 'Join link')}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text type="secondary">{room.candidateIds.length} candidate(s)</Text>
                <Button
                  type="primary"
                  onClick={() => navigate('/interviewer')}
                >
                  View Candidates
                </Button>
              </div>
            </Space>
          </Card>
        ))}
      </div>

      <Modal
        title="Create New Interview Room"
        open={showCreateModal}
        onOk={handleCreateRoom}
        onCancel={() => setShowCreateModal(false)}
        okText="Create Room"
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Text>Room Title:</Text>
            <Input
              placeholder="e.g., Frontend Developer Interview - Jan 2025"
              value={newRoomTitle}
              onChange={(e) => setNewRoomTitle(e.target.value)}
              onPressEnter={handleCreateRoom}
              size="large"
              style={{ marginTop: '8px' }}
            />
          </div>
          <Paragraph type="secondary" style={{ marginBottom: 0 }}>
            After creating the room, you'll get a unique code and link to share with candidates.
          </Paragraph>
        </Space>
      </Modal>
    </div>
  );
};

export default InterviewerRoomDashboard;
