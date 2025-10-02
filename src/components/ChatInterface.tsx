import { useEffect, useState, useRef } from 'react';
import { Card, Input, Button, List, Typography, Progress, Tag, Space, App, Tooltip } from 'antd';
import { ClockCircleOutlined, SendOutlined, AudioOutlined, AudioMutedOutlined } from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import {
  startInterview,
  nextQuestion,
  setCurrentAnswer,
  completeInterview,
} from '../store/slices/interviewSlice';
import {
  updateCandidate,
  addMessageToCandidate,
  addQuestionAnswer,
} from '../store/slices/candidatesSlice';
import { generateQuestions, evaluateAnswer, generateSummary } from '../utils/aiService';
import type { Message, QuestionAnswer } from '../store/slices/candidatesSlice';
import type { Question } from '../utils/aiService';

const { TextArea } = Input;
const { Title, Text } = Typography;

const ChatInterface = () => {
  const dispatch = useAppDispatch();
  const { message } = App.useApp();
  const { currentCandidateId, currentQuestionIndex, currentAnswer, stage, missingFields } =
    useAppSelector((state) => state.interview);
  const candidates = useAppSelector((state) => state.candidates.candidates);
  const candidate = candidates.find((c: { id: string | null }) => c.id === currentCandidateId);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [missingFieldsData, setMissingFieldsData] = useState<Record<string, string>>({});
  const [isListening, setIsListening] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recognitionRef = useRef<any>(null);

  const currentQuestion = questions[currentQuestionIndex];

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [candidate?.chatHistory]);

  // Load questions when interview starts
  useEffect(() => {
    if (stage === 'interview' && questions.length === 0 && candidate) {
      loadQuestions();
    }
  }, [stage, candidate]);

  // Timer logic
  useEffect(() => {
    if (stage === 'interview' && currentQuestion && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [stage, currentQuestion, timeLeft]);

  // Initialize timer when question changes
  useEffect(() => {
    if (currentQuestion) {
      setTimeLeft(currentQuestion.timeLimit);
    }
  }, [currentQuestion]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          dispatch(setCurrentAnswer(currentAnswer + finalTranscript));
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          message.error('Microphone access denied. Please allow microphone permissions.');
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [currentAnswer, dispatch]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      message.warning('Speech recognition is not supported in your browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      message.info('Listening... Speak your answer');
    }
  };

  const loadQuestions = async () => {
    if (!candidate) return;
    setIsLoading(true);

    try {
      const generatedQuestions = await generateQuestions(candidate.resumeText);
      setQuestions(generatedQuestions);

      // Add first question to chat
      const questionMsg: Message = {
        id: `msg-${Date.now()}`,
        type: 'bot',
        content: `Question 1/${generatedQuestions.length} (${generatedQuestions[0].difficulty}): ${generatedQuestions[0].question}`,
        timestamp: Date.now(),
      };
      dispatch(addMessageToCandidate({ candidateId: candidate.id, message: questionMsg }));
      dispatch(updateCandidate({ id: candidate.id, updates: { status: 'in-progress' } }));
    } catch (error) {
      message.error('Failed to generate questions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMissingFieldSubmit = () => {
    if (!candidate) return;

    const updates: Record<string, string> = {};
    missingFields.forEach((field: string) => {
      if (missingFieldsData[field]) {
        updates[field] = missingFieldsData[field];
      }
    });

    if (Object.keys(updates).length === missingFields.length) {
      dispatch(updateCandidate({ id: candidate.id, updates }));
      dispatch(startInterview(candidate.id));
      message.success('Information collected! Starting interview...');
    } else {
      message.warning('Please fill in all required fields');
    }
  };

  const handleAutoSubmit = async () => {
    if (!currentQuestion || !candidate) return;

    await submitAnswer(currentAnswer || 'No answer provided');
  };

  const handleSubmit = async () => {
    if (!currentAnswer.trim() || !currentQuestion || !candidate) {
      message.warning('Please provide an answer');
      return;
    }

    await submitAnswer(currentAnswer);
  };

  const submitAnswer = async (answer: string) => {
    if (!currentQuestion || !candidate) return;

    setIsLoading(true);

    try {
      // Evaluate answer
      const evaluation = await evaluateAnswer(
        currentQuestion.question,
        answer,
        currentQuestion.difficulty
      );

      // Add user answer to chat
      const answerMsg: Message = {
        id: `msg-${Date.now()}`,
        type: 'user',
        content: answer,
        timestamp: Date.now(),
      };
      dispatch(addMessageToCandidate({ candidateId: candidate.id, message: answerMsg }));

      // Add QA to candidate
      const qa: QuestionAnswer = {
        questionId: currentQuestion.id,
        question: currentQuestion.question,
        answer,
        difficulty: currentQuestion.difficulty,
        timeLimit: currentQuestion.timeLimit,
        timeSpent: currentQuestion.timeLimit - timeLeft,
        score: evaluation.score,
      };
      dispatch(addQuestionAnswer({ candidateId: candidate.id, qa }));

      // Add feedback
      const feedbackMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        type: 'system',
        content: `Score: ${evaluation.score}/10 - ${evaluation.feedback}`,
        timestamp: Date.now(),
      };
      dispatch(addMessageToCandidate({ candidateId: candidate.id, message: feedbackMsg }));

      // Check if interview is complete
      if (currentQuestionIndex >= questions.length - 1) {
        await completeInterviewFlow();
      } else {
        // Move to next question
        dispatch(nextQuestion());
        dispatch(setCurrentAnswer(''));

        const nextQ = questions[currentQuestionIndex + 1];
        const nextQMsg: Message = {
          id: `msg-${Date.now() + 2}`,
          type: 'bot',
          content: `Question ${currentQuestionIndex + 2}/${questions.length} (${nextQ.difficulty}): ${nextQ.question}`,
          timestamp: Date.now(),
        };
        dispatch(addMessageToCandidate({ candidateId: candidate.id, message: nextQMsg }));
      }
    } catch (error) {
      message.error('Failed to submit answer');
    } finally {
      setIsLoading(false);
    }
  };

  const completeInterviewFlow = async () => {
    if (!candidate) return;

    const totalScore =
      candidate.questionsAnswers.reduce((sum: number, qa: QuestionAnswer) => sum + qa.score, 0) /
      candidate.questionsAnswers.length;

    const summary = await generateSummary(candidate.name, candidate.questionsAnswers);

    dispatch(
      updateCandidate({
        id: candidate.id,
        updates: {
          status: 'completed',
          finalScore: Math.round(totalScore * 10) / 10,
          summary,
        },
      })
    );

    const completionMsg: Message = {
      id: `msg-${Date.now()}`,
      type: 'system',
      content: `Interview completed! Final Score: ${Math.round(totalScore * 10) / 10}/10\n\nSummary: ${summary}`,
      timestamp: Date.now(),
    };
    dispatch(addMessageToCandidate({ candidateId: candidate.id, message: completionMsg }));
    dispatch(completeInterview());
  };

  if (!candidate) return null;

  // Collect missing info stage
  if (stage === 'collect-info') {
    return (
      <Card style={{ maxWidth: 600, margin: '0 auto' }}>
        <Title level={3}>Complete Your Information</Title>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {missingFields.includes('name') && (
            <div>
              <Text>Name:</Text>
              <Input
                placeholder="Enter your full name"
                value={missingFieldsData.name || ''}
                onChange={(e) => setMissingFieldsData({ ...missingFieldsData, name: e.target.value })}
              />
            </div>
          )}
          {missingFields.includes('email') && (
            <div>
              <Text>Email:</Text>
              <Input
                placeholder="Enter your email"
                type="email"
                value={missingFieldsData.email || ''}
                onChange={(e) => setMissingFieldsData({ ...missingFieldsData, email: e.target.value })}
              />
            </div>
          )}
          {missingFields.includes('phone') && (
            <div>
              <Text>Phone:</Text>
              <Input
                placeholder="Enter your phone number"
                value={missingFieldsData.phone || ''}
                onChange={(e) => setMissingFieldsData({ ...missingFieldsData, phone: e.target.value })}
              />
            </div>
          )}
          <Button type="primary" onClick={handleMissingFieldSubmit} block>
            Start Interview
          </Button>
        </Space>
      </Card>
    );
  }

  const progressPercent = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
  const timePercent = currentQuestion ? (timeLeft / currentQuestion.timeLimit) * 100 : 0;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Title level={4}>Interview Progress</Title>
            <Progress percent={Math.round(progressPercent)} status="active" />
          </div>

          {stage === 'interview' && currentQuestion && (
            <div>
              <Space>
                <ClockCircleOutlined />
                <Text strong>Time Remaining: {timeLeft}s</Text>
                <Tag color={currentQuestion.difficulty === 'Easy' ? 'green' : currentQuestion.difficulty === 'Medium' ? 'orange' : 'red'}>
                  {currentQuestion.difficulty}
                </Tag>
              </Space>
              <Progress
                percent={timePercent}
                status={timeLeft < 10 ? 'exception' : 'active'}
                showInfo={false}
                strokeColor={timeLeft < 10 ? '#ff4d4f' : '#1890ff'}
              />
            </div>
          )}

          <Card
            style={{
              height: 400,
              overflowY: 'auto',
              backgroundColor: '#fafafa',
            }}
          >
            <List
              dataSource={candidate.chatHistory}
              renderItem={(msg: Message) => (
                <List.Item
                  style={{
                    justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
                    border: 'none',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '70%',
                      padding: '8px 12px',
                      borderRadius: 8,
                      backgroundColor:
                        msg.type === 'user'
                          ? '#1890ff'
                          : msg.type === 'system'
                          ? '#f0f0f0'
                          : '#e6f7ff',
                      color: msg.type === 'user' ? 'white' : 'black',
                    }}
                  >
                    <Text style={{ color: msg.type === 'user' ? 'white' : 'inherit', whiteSpace: 'pre-wrap' }}>
                      {msg.content}
                    </Text>
                  </div>
                </List.Item>
              )}
            />
            <div ref={chatEndRef} />
          </Card>

          {stage === 'interview' && currentQuestion && (
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              <Space.Compact style={{ width: '100%' }}>
                <TextArea
                  value={currentAnswer}
                  onChange={(e) => dispatch(setCurrentAnswer(e.target.value))}
                  placeholder="Type your answer or click the microphone to speak..."
                  autoSize={{ minRows: 2, maxRows: 4 }}
                  disabled={isLoading}
                  onPressEnter={(e) => {
                    if (e.shiftKey) return;
                    e.preventDefault();
                    handleSubmit();
                  }}
                />
                <Tooltip title={isListening ? 'Stop listening' : 'Start voice input'}>
                  <Button
                    icon={isListening ? <AudioMutedOutlined /> : <AudioOutlined />}
                    onClick={toggleListening}
                    disabled={isLoading}
                    danger={isListening}
                    type={isListening ? 'primary' : 'default'}
                  />
                </Tooltip>
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleSubmit}
                  loading={isLoading}
                  disabled={!currentAnswer.trim()}
                >
                  Submit
                </Button>
              </Space.Compact>
              {isListening && (
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  🎤 Listening... Speak your answer clearly
                </Text>
              )}
            </Space>
          )}

          {stage === 'completed' && (
            <div style={{ textAlign: 'center' }}>
              <Title level={3}>Interview Completed!</Title>
              <Text>Thank you for your time. Your responses have been recorded.</Text>
            </div>
          )}
        </Space>
      </Card>
    </div>
  );
};

export default ChatInterface;
