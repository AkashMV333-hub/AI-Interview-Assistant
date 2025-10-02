import { useState, useEffect } from 'react';
import { Card, Input, Button, Typography, Space, App, Modal } from 'antd';
import { LoginOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setRoomCode as setInterviewRoomCode } from '../store/slices/interviewSlice';
import { roomsAPI } from '../services/api';

const { Title, Paragraph, Text } = Typography;

const JoinInterviewRoom = () => {
  const { roomCode: urlRoomCode } = useParams();
  const [roomCode, setRoomCode] = useState(urlRoomCode || '');
  const [loading, setLoading] = useState(false);
  const [showCompletedModal, setShowCompletedModal] = useState(false);
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
          setLoading(false);
          setShowCompletedModal(true);
          return; // Don't navigate, block the user
        } else if (response.existingCandidate.status === 'in-progress') {
          message.warning('Resuming your interview...');
          // Save room code to Redux and navigate
          dispatch(setInterviewRoomCode(response.room.roomCode));
          setTimeout(() => {
            navigate('/interviewee');
            setLoading(false);
          }, 500);
          return;
        }
      }

      // New candidate joining
      message.success(`Joined "${response.room.title}" successfully!`);

      // Save room code to Redux for later use
      dispatch(setInterviewRoomCode(response.room.roomCode));

      // Navigate to interview
      setTimeout(() => {
        navigate('/interviewee');
        setLoading(false);
      }, 500);
    } catch (error: any) {
      console.error('Error joining room:', error);
      setLoading(false);

      // Check if error is about completed interview
      if (error.message && error.message.includes('already completed')) {
        setShowCompletedModal(true);
      } else {
        message.error(error.message || 'Failed to join room. Please check the code and try again.');
      }
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
          maxWidth: 550,
          width: '100%',
          borderRadius: '0',
          border: '1px solid #e0e0e0',
          boxShadow: 'none',
          background: '#ffffff'
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{
            textAlign: 'center',
            padding: '24px 0 16px',
            borderBottom: '2px solid #0000cc'
          }}>
            <Title level={2} style={{ color: '#161616', margin: 0, marginBottom: '8px' }}>
              Join Interview Room
            </Title>
            <Paragraph style={{ color: '#525252', margin: 0, fontSize: '15px' }}>
              Enter the room code provided by your interviewer
            </Paragraph>
          </div>

          <div>
            <Text strong style={{ fontSize: '15px', color: '#161616', fontWeight: '600' }}>Room Code:</Text>
            <Input
              placeholder="Enter room code (e.g., INT-ABC123)"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              onPressEnter={handleJoinRoom}
              size="large"
              style={{
                marginTop: '10px',
                borderRadius: '0',
                border: '2px solid #e0e0e0',
                fontSize: '16px',
                padding: '12px',
                fontWeight: '600',
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
              borderRadius: '0',
              fontSize: '16px',
              fontWeight: '600',
              background: '#0000cc',
              border: 'none'
            }}
          >
            Join Interview Room
          </Button>

          <div style={{
            textAlign: 'center',
            padding: '12px 16px',
            background: '#f4f4f4',
            borderRadius: '0',
            border: '1px solid #e0e0e0'
          }}>
            <Text type="secondary" style={{ fontSize: '13px', color: '#525252' }}>
              Make sure you have the correct room code from your interviewer
            </Text>
          </div>
        </Space>
      </Card>

      <Modal
        open={showCompletedModal}
        onOk={() => setShowCompletedModal(false)}
        onCancel={() => setShowCompletedModal(false)}
        footer={[
          <Button
            key="ok"
            type="primary"
            onClick={() => setShowCompletedModal(false)}
            style={{
              borderRadius: '0',
              height: '40px',
              fontWeight: '600'
            }}
          >
            OK
          </Button>
        ]}
        centered
      >
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <CheckCircleOutlined style={{ fontSize: '64px', color: '#0000cc', marginBottom: '24px' }} />
          <Title level={3} style={{ color: '#161616', marginBottom: '16px' }}>
            Interview Already Completed
          </Title>
          <Text style={{ color: '#525252', fontSize: '15px' }}>
            You have already completed this interview. You cannot retake it.
            <br />
            Please contact the interviewer for any queries.
          </Text>
        </div>
      </Modal>
    </div>
  );
};

export default JoinInterviewRoom;
