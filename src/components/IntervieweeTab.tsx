import { useEffect, useState } from 'react';
import { Button, Card, Typography, Spin } from 'antd';
import { LogoutOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import ResumeUpload from './ResumeUpload';
import ChatInterface from './ChatInterface';
import { setStage, startInterview } from '../store/slices/interviewSlice';
import { logout } from '../store/slices/authSlice';
import { removeTokenCookie } from '../utils/jwtUtils';
import { candidatesAPI } from '../services/api';
import { addCandidate } from '../store/slices/candidatesSlice';

const { Title, Text } = Typography;

const IntervieweeTab = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { stage, currentCandidateId, currentRoomCode } = useAppSelector((state) => state.interview);
  const candidates = useAppSelector((state) => state.candidates.candidates);
  const currentCandidate = candidates.find((c: { id: string | null }) => c.id === currentCandidateId);
  const { userName, userEmail } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [interviewStatus, setInterviewStatus] = useState<'not-started' | 'in-progress' | 'completed'>('not-started');

  const handleLogout = () => {
    removeTokenCookie();
    dispatch(logout());
    navigate('/');
  };

  useEffect(() => {
    // Fetch candidate status from backend when component loads
    const fetchCandidateStatus = async () => {
      if (currentRoomCode && userEmail) {
        try {
          setLoading(true);
          const response = await candidatesAPI.getCandidatesByRoom(currentRoomCode);
          const existingCandidate = response.find((c: any) => c.email === userEmail);

          if (existingCandidate) {
            // Add candidate to Redux store
            dispatch(addCandidate(existingCandidate));
            dispatch(startInterview(existingCandidate.id));

            if (existingCandidate.status === 'completed') {
              setInterviewStatus('completed');
              dispatch(setStage('completed'));
            } else if (existingCandidate.status === 'in-progress') {
              setInterviewStatus('in-progress');
              dispatch(setStage('interview'));
            } else {
              setInterviewStatus('not-started');
            }
          } else {
            setInterviewStatus('not-started');
          }
        } catch (error) {
          console.error('Error fetching candidate status:', error);
          setInterviewStatus('not-started');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchCandidateStatus();
  }, [currentRoomCode, userEmail, dispatch]);

  useEffect(() => {
    // If there's a current candidate but stage is upload, move to appropriate stage
    if (currentCandidate && stage === 'upload') {
      if (currentCandidate.status === 'completed') {
        dispatch(setStage('completed'));
        setInterviewStatus('completed');
      } else if (currentCandidate.status === 'in-progress') {
        dispatch(setStage('interview'));
        setInterviewStatus('in-progress');
      }
    }
  }, [currentCandidate, stage, dispatch]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f4f4f4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f4f4f4' }}>
      <div
        style={{
          background: '#ffffff',
          padding: '20px 32px',
          border: '1px solid #e0e0e0',
          borderLeft: '4px solid #0000cc',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <h2 style={{ margin: 0, color: '#161616', fontSize: '24px', fontWeight: '600' }}>Welcome, {userName}</h2>
          <p style={{ margin: 0, color: '#525252', fontSize: '14px' }}>Interviewee Portal</p>
        </div>
        <Button
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          style={{
            height: '40px',
            borderRadius: '0',
            border: '1px solid #e0e0e0',
            fontWeight: '600'
          }}
        >
          Logout
        </Button>
      </div>
      <div style={{ padding: '24px' }}>
        {interviewStatus === 'completed' ? (
          <div style={{
            minHeight: 'calc(100vh - 200px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Card style={{
              maxWidth: 600,
              width: '100%',
              borderRadius: '0',
              border: '1px solid #e0e0e0',
              textAlign: 'center'
            }}>
              <div style={{
                padding: '48px 32px',
                background: '#d0e2ff',
                border: '4px solid #0000cc',
                marginTop: '-24px',
                marginLeft: '-24px',
                marginRight: '-24px',
                marginBottom: '32px'
              }}>
                <CheckCircleOutlined style={{ fontSize: '72px', color: '#0000cc', marginBottom: '24px' }} />
                <Title level={2} style={{ color: '#161616', marginBottom: '16px' }}>
                  Interview Completed
                </Title>
                <Text style={{ color: '#161616', fontSize: '16px' }}>
                  Thank you for completing the interview. Your responses have been recorded and evaluated.
                </Text>
              </div>
              <Text style={{ color: '#525252', fontSize: '14px' }}>
                You cannot retake this interview. Please contact the interviewer for any queries.
              </Text>
            </Card>
          </div>
        ) : (
          <>
            {stage === 'upload' || !currentCandidateId ? (
              <ResumeUpload />
            ) : (
              <ChatInterface />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default IntervieweeTab;
