import { useState, useEffect } from 'react';
import { Card, Button, Typography, Space, Input, Modal, Spin, App } from 'antd';
import { PlusOutlined, CopyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { roomsAPI } from '../services/api';

const { Title, Text, Paragraph } = Typography;

const InterviewerRoomDashboard = () => {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRoomTitle, setNewRoomTitle] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch rooms from backend
  const fetchRooms = async () => {
    try {
      setLoading(true);
      const data = await roomsAPI.getRooms();
      setRooms(data);
    } catch (error: any) {
      console.error('Error fetching rooms:', error);
      message.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleCreateRoom = async () => {
    if (!newRoomTitle.trim()) {
      message.warning('Please enter a room title');
      return;
    }

    try {
      const response = await roomsAPI.createRoom({ title: newRoomTitle });
      message.success(`Interview room created! Code: ${response.room.roomCode}`);
      setNewRoomTitle('');
      setShowCreateModal(false);
      fetchRooms(); // Refresh the list
    } catch (error: any) {
      console.error('Error creating room:', error);
      message.error(error.message || 'Failed to create room');
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    message.success(`${label} copied to clipboard!`);
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

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

      {rooms.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '48px' }}>
          <Title level={4}>No interview rooms yet</Title>
          <Text type="secondary">Create your first room to get started</Text>
        </Card>
      ) : (
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
      )}

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
