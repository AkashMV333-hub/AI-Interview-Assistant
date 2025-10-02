import { useState, useEffect } from 'react';
import { Card, Button, Typography, Space, Input, Modal, Spin, App } from 'antd';
import { PlusOutlined, CopyOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { roomsAPI, authAPI } from '../services/api';
import { logout } from '../store/slices/authSlice';
import Cookies from 'js-cookie';

const { Title, Text, Paragraph } = Typography;

const InterviewerRoomDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
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

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      // Remove the auth token cookie
      Cookies.remove('auth_token');
      // Clear Redux state
      dispatch(logout());
      message.success('Logged out successfully');
      navigate('/');
    } catch (error: any) {
      console.error('Error logging out:', error);
      // Even if API call fails, clear local auth data
      Cookies.remove('auth_token');
      dispatch(logout());
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#f4f4f4',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f4f4f4',
      padding: '32px 24px'
    }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        {/* Header Section */}
        <div style={{
          background: '#ffffff',
          padding: '24px 32px',
          marginBottom: '32px',
          border: '1px solid #e0e0e0',
          borderLeft: '4px solid #0000cc'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <Title level={2} style={{ color: '#161616', margin: 0, marginBottom: '8px' }}>
                Your Interview Rooms
              </Title>
              <Text style={{ color: '#525252', fontSize: '14px' }}>
                Manage and monitor your interview sessions
              </Text>
            </div>
            <Space size="middle">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setShowCreateModal(true)}
                size="large"
                style={{
                  height: '48px',
                  borderRadius: '0',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Create New Room
              </Button>
              <Button
                icon={<LogoutOutlined />}
                onClick={handleLogout}
                size="large"
                style={{
                  height: '48px',
                  borderRadius: '0',
                  fontSize: '14px',
                  fontWeight: '600',
                  border: '1px solid #e0e0e0'
                }}
              >
                Logout
              </Button>
            </Space>
          </div>
        </div>

      {rooms.length === 0 ? (
        <Card style={{
          textAlign: 'center',
          padding: '64px 32px',
          borderRadius: '0',
          background: '#ffffff',
          border: '1px solid #e0e0e0'
        }}>
          <Title level={3} style={{ marginBottom: '12px', color: '#161616' }}>No interview rooms yet</Title>
          <Text type="secondary" style={{ fontSize: '14px', color: '#525252' }}>
            Create your first room to get started with interviews
          </Text>
        </Card>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
          gap: '24px'
        }}>
        {rooms.map((room) => (
          <Card
            key={room.roomId}
            hoverable
            style={{
              borderRadius: '0',
              background: '#ffffff',
              border: '1px solid #e0e0e0'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div>
                <Title level={4} style={{ marginBottom: '8px', color: '#161616' }}>
                  {room.title}
                </Title>
                <Text type="secondary" style={{ fontSize: '13px', color: '#525252' }}>
                  Created {new Date(room.createdAt).toLocaleDateString()}
                </Text>
              </div>

              <div style={{
                background: '#d0e2ff',
                padding: '16px',
                borderRadius: '0',
                border: '1px solid #0000cc'
              }}>
                <Text strong style={{ color: '#161616', fontSize: '13px', display: 'block', marginBottom: '8px' }}>Room Code</Text>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Text code style={{
                    fontSize: '18px',
                    flex: 1,
                    background: '#ffffff',
                    color: '#161616',
                    padding: '8px 12px',
                    borderRadius: '0',
                    fontWeight: '600',
                    letterSpacing: '1px',
                    border: '1px solid #0000cc'
                  }}>
                    {room.roomCode}
                  </Text>
                  <Button
                    icon={<CopyOutlined />}
                    onClick={() => copyToClipboard(room.roomCode, 'Room code')}
                    style={{
                      background: '#0000cc',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '0',
                      height: '40px'
                    }}
                  />
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 0',
                borderTop: '1px solid #e0e0e0'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Text strong style={{ fontSize: '14px', color: '#161616' }}>
                    {room.candidateIds.length} candidate{room.candidateIds.length !== 1 ? 's' : ''}
                  </Text>
                </div>
                <Button
                  type="primary"
                  onClick={() => navigate(`/interviewer/${room.roomCode}`)}
                  style={{
                    borderRadius: '0',
                    fontWeight: '600',
                    height: '40px'
                  }}
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
        title={
          <div style={{
            padding: '8px 0',
            borderBottom: '2px solid #0000cc'
          }}>
            <Title level={4} style={{ margin: 0, color: '#0000cc' }}>
              Create New Interview Room
            </Title>
          </div>
        }
        open={showCreateModal}
        onOk={handleCreateRoom}
        onCancel={() => setShowCreateModal(false)}
        okText="Create Room"
        okButtonProps={{
          style: {
            background: '#0000cc',
            border: 'none',
            height: '40px',
            borderRadius: '0',
            fontWeight: '600'
          }
        }}
        cancelButtonProps={{
          style: {
            height: '40px',
            borderRadius: '0'
          }
        }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div style={{ marginTop: '16px' }}>
            <Text strong style={{ fontSize: '14px' }}>Room Title:</Text>
            <Input
              placeholder="e.g., Frontend Developer Interview - Jan 2025"
              value={newRoomTitle}
              onChange={(e) => setNewRoomTitle(e.target.value)}
              onPressEnter={handleCreateRoom}
              size="large"
              style={{
                marginTop: '10px',
                borderRadius: '0',
                border: '2px solid #e0e0e0'
              }}
            />
          </div>
          <div style={{
            padding: '12px 16px',
            background: '#f4f4f4',
            borderRadius: '0',
            border: '1px solid #e0e0e0'
          }}>
            <Paragraph type="secondary" style={{ marginBottom: 0, fontSize: '13px' }}>
              After creating the room, you'll get a unique code to share with candidates.
            </Paragraph>
          </div>
        </Space>
      </Modal>
      </div>
    </div>
  );
};

export default InterviewerRoomDashboard;
