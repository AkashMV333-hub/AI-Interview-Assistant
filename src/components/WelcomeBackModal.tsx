import { useEffect, useState, useRef } from 'react';
import { Modal, Button } from 'antd';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { resumeInterview, resetInterview } from '../store/slices/interviewSlice';

const WelcomeBackModal = () => {
  const [visible, setVisible] = useState(false);
  const hasChecked = useRef(false);
  const dispatch = useAppDispatch();
  const { isInterviewActive, currentCandidateId, stage, isPaused } = useAppSelector(
    (state) => state.interview
  );
  const candidates = useAppSelector((state) => state.candidates.candidates);

  useEffect(() => {
    // Only show modal once on initial mount if there's an unfinished interview
    // Don't show if interview is actively running (isPaused would be false for active interviews)
    if (!hasChecked.current && isInterviewActive && currentCandidateId && stage !== 'completed') {
      const candidate = candidates.find((c: { id: string | null }) => c.id === currentCandidateId);
      if (candidate && candidate.status !== 'completed' && candidate.questionsAnswers.length > 0) {
        // Only show if there are already some answers (meaning it was interrupted)
        setVisible(true);
      }
      hasChecked.current = true;
    }
  }, []);

  const handleResume = () => {
    dispatch(resumeInterview());
    setVisible(false);
  };

  const handleStartNew = () => {
    dispatch(resetInterview());
    setVisible(false);
  };

  const candidate = candidates.find((c: { id: string | null }) => c.id === currentCandidateId);

  return (
    <Modal
      title="Welcome Back!"
      open={visible}
      closable={false}
      footer={[
        <Button key="new" onClick={handleStartNew}>
          Start New Interview
        </Button>,
        <Button key="resume" type="primary" onClick={handleResume}>
          Resume Interview
        </Button>,
      ]}
    >
      <p>
        You have an unfinished interview session
        {candidate?.name ? ` with ${candidate.name}` : ''}.
      </p>
      <p>Would you like to resume or start a new interview?</p>
    </Modal>
  );
};

export default WelcomeBackModal;
