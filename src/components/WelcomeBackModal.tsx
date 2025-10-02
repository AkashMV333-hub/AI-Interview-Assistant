import { useEffect, useState, useRef } from 'react';
import { Modal, Button, Typography, Space } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setStage } from '../store/slices/interviewSlice';

const { Title, Text } = Typography;

const WelcomeBackModal = () => {
  const [visible, setVisible] = useState(false);
  const hasChecked = useRef(false);
  const dispatch = useAppDispatch();
  const { currentCandidateId, stage } = useAppSelector((state) => state.interview);
  const candidates = useAppSelector((state) => state.candidates.candidates);

  useEffect(() => {
    // Only show modal once on initial mount if there's an unfinished interview
    if (!hasChecked.current && currentCandidateId && stage !== 'completed') {
      const candidate = candidates.find((c: { id: string | null }) => c.id === currentCandidateId);
      if (candidate && candidate.status === 'in-progress') {
        // Only show if interview is in progress
        setVisible(true);
      }
      hasChecked.current = true;
    }
  }, [currentCandidateId, stage, candidates]);

  const handleResume = () => {
    dispatch(setStage('interview'));
    setVisible(false);
  };

  const candidate = candidates.find((c: { id: string | null }) => c.id === currentCandidateId);
  const progress = candidate ? candidate.questionsAnswers.length : 0;

  return (
    <Modal
      open={visible}
      closable={false}
      centered
      footer={[
        <Button
          key="resume"
          type="primary"
          onClick={handleResume}
          size="large"
          style={{
            borderRadius: '0',
            height: '48px',
            fontWeight: '600',
            minWidth: '160px'
          }}
        >
          Continue Interview
        </Button>,
      ]}
    >
      <div style={{ textAlign: 'center', padding: '24px 0' }}>
        <ClockCircleOutlined style={{ fontSize: '64px', color: '#0000cc', marginBottom: '24px' }} />
        <Title level={3} style={{ color: '#161616', marginBottom: '16px' }}>
          Welcome Back!
        </Title>
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Text style={{ color: '#525252', fontSize: '15px' }}>
            You have an unfinished interview session.
          </Text>
          {progress > 0 && (
            <Text style={{ color: '#525252', fontSize: '15px', fontWeight: '600' }}>
              Progress: {progress} question{progress !== 1 ? 's' : ''} answered
            </Text>
          )}
          <Text style={{ color: '#525252', fontSize: '14px', marginTop: '16px' }}>
            Your progress has been saved. Click below to continue where you left off.
          </Text>
        </Space>
      </div>
    </Modal>
  );
};

export default WelcomeBackModal;
