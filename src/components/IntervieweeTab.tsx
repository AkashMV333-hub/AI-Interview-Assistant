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
    <div style={{ minHeight: '100vh', background: '#f4f4f4' }}>
      <div
        style={{
          background: '#ffffff',
          padding: '20px 32px',
          border: '1px solid #e0e0e0',
          borderLeft: '4px solid #0f62fe',
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
