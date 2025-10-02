import { useEffect } from 'react';
import { Button } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import ResumeUpload from './ResumeUpload';
import ChatInterface from './ChatInterface';
import { setStage } from '../store/slices/interviewSlice';
import { logout } from '../store/slices/authSlice';
import { removeTokenCookie } from '../utils/jwtUtils';

const IntervieweeTab = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { stage, currentCandidateId } = useAppSelector((state) => state.interview);
  const candidates = useAppSelector((state) => state.candidates.candidates);
  const currentCandidate = candidates.find((c: { id: string | null }) => c.id === currentCandidateId);
  const { userName } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    removeTokenCookie();
    dispatch(logout());
    navigate('/');
  };

  useEffect(() => {
    // If there's a current candidate but stage is upload, move to appropriate stage
    if (currentCandidate && stage === 'upload') {
      if (currentCandidate.status === 'completed') {
        dispatch(setStage('completed'));
      } else if (currentCandidate.status === 'in-progress') {
        dispatch(setStage('interview'));
      }
    }
  }, [currentCandidate, stage, dispatch]);

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <div
        style={{
          background: '#fff',
          padding: '16px 24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>Welcome, {userName}</h2>
          <p style={{ margin: 0, color: '#666' }}>Interviewee Portal</p>
        </div>
        <Button icon={<LogoutOutlined />} onClick={handleLogout}>
          Logout
        </Button>
      </div>
      <div style={{ padding: '24px' }}>
        {stage === 'upload' || !currentCandidateId ? (
          <ResumeUpload />
        ) : (
          <ChatInterface />
        )}
      </div>
    </div>
  );
};

export default IntervieweeTab;
