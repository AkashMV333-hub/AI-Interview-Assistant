import { useState, useEffect } from 'react';
import { Table, Input, Card, Typography, Tag, Space, Button, Modal, List, Spin } from 'antd';
import { SearchOutlined, EyeOutlined, DownloadOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import { removeTokenCookie } from '../utils/jwtUtils';
import { candidatesAPI } from '../services/api';
import { addCandidate, updateCandidate } from '../store/slices/candidatesSlice';
import type { Candidate, QuestionAnswer } from '../store/slices/candidatesSlice';

const { Title, Text } = Typography;

const InterviewerTab = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { roomCode } = useParams<{ roomCode: string }>();
  const candidates = useAppSelector((state) => state.candidates.candidates);
  const { userName } = useAppSelector((state) => state.auth);
  const [searchText, setSearchText] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCandidates = async () => {
      if (!roomCode) {
        navigate('/interviewer/rooms');
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching candidates for room:', roomCode);
        const data = await candidatesAPI.getCandidatesByRoom(roomCode);
        console.log('Fetched candidates:', data);
        // Update Redux store with candidates (check for duplicates)
        data.forEach((candidate: Candidate) => {
          const exists = candidates.find((c) => c.id === candidate.id);
          if (!exists) {
            dispatch(addCandidate(candidate));
          } else {
            dispatch(updateCandidate({ id: candidate.id, updates: candidate }));
          }
        });
      } catch (error: any) {
        console.error('Error fetching candidates:', error);
        console.error('Error details:', error.message, error.response);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, [roomCode, dispatch, navigate]);

  const handleLogout = () => {
    removeTokenCookie();
    dispatch(logout());
    navigate('/');
  };

  const filteredCandidates = candidates.filter(
    (candidate: Candidate) =>
      candidate.name.toLowerCase().includes(searchText.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchText.toLowerCase()) ||
      candidate.phone.includes(searchText)
  );

  const sortedCandidates = [...filteredCandidates].sort((a, b) => b.finalScore - a.finalScore);

  const downloadResume = (candidate: Candidate) => {
    if (candidate.resumeFile) {
      const link = document.createElement('a');
      link.href = candidate.resumeFile.data;
      link.download = candidate.resumeFile.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Candidate, b: Candidate) => a.name.localeCompare(b.name),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color =
          status === 'completed' ? 'green' : status === 'in-progress' ? 'blue' : 'default';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
      filters: [
        { text: 'Pending', value: 'pending' },
        { text: 'In Progress', value: 'in-progress' },
        { text: 'Completed', value: 'completed' },
      ],
      onFilter: (value: any, record: Candidate) => record.status === value,
    },
    {
      title: 'Final Score',
      dataIndex: 'finalScore',
      key: 'finalScore',
      render: (score: number) => {
        const color = score >= 7 ? 'green' : score >= 5 ? 'orange' : 'red';
        return <Tag color={color}>{score > 0 ? `${score}/10` : 'N/A'}</Tag>;
      },
      sorter: (a: Candidate, b: Candidate) => a.finalScore - b.finalScore,
      defaultSortOrder: 'descend' as const,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: Candidate) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => {
            setSelectedCandidate(record);
            setDetailsVisible(true);
          }}
        >
          View Details
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f4f4f4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

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
          <p style={{ margin: 0, color: '#666' }}>Interviewer Dashboard</p>
        </div>
        <Button icon={<LogoutOutlined />} onClick={handleLogout}>
          Logout
        </Button>
      </div>
      <div style={{ padding: '24px' }}>
        <Card>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
              <Title level={3}>Candidate Dashboard</Title>
              <Input
                placeholder="Search by name, email, or phone"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ maxWidth: 400 }}
              />
            </div>

          <Table
            dataSource={sortedCandidates}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
          </Space>
        </Card>
      </div>

      <Modal
        title={`Candidate Details - ${selectedCandidate?.name}`}
        open={detailsVisible}
        onCancel={() => setDetailsVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailsVisible(false)}>
            Close
          </Button>,
        ]}
        width={800}
      >
        {selectedCandidate && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Card size="small" title="Profile Information">
              <p>
                <Text strong>Name:</Text> {selectedCandidate.name}
              </p>
              <p>
                <Text strong>Email:</Text> {selectedCandidate.email}
              </p>
              <p>
                <Text strong>Phone:</Text> {selectedCandidate.phone}
              </p>
              <p>
                <Text strong>Status:</Text>{' '}
                <Tag
                  color={
                    selectedCandidate.status === 'completed'
                      ? 'green'
                      : selectedCandidate.status === 'in-progress'
                      ? 'blue'
                      : 'default'
                  }
                >
                  {selectedCandidate.status.toUpperCase()}
                </Tag>
              </p>
              <p>
                <Text strong>Final Score:</Text>{' '}
                <Tag
                  color={
                    selectedCandidate.finalScore >= 7
                      ? 'green'
                      : selectedCandidate.finalScore >= 5
                      ? 'orange'
                      : 'red'
                  }
                >
                  {selectedCandidate.finalScore > 0
                    ? `${selectedCandidate.finalScore}/10`
                    : 'N/A'}
                </Tag>
              </p>
              {selectedCandidate.resumeFile && (
                <p>
                  <Button
                    type="link"
                    icon={<DownloadOutlined />}
                    onClick={() => downloadResume(selectedCandidate)}
                  >
                    Download Resume ({selectedCandidate.resumeFile.name})
                  </Button>
                </p>
              )}
            </Card>

            {selectedCandidate.profileDescription && (
              <Card size="small" title="Profile Description">
                <Text>{selectedCandidate.profileDescription}</Text>
              </Card>
            )}

            {selectedCandidate.summary && (
              <Card size="small" title="AI Summary">
                <Text>{selectedCandidate.summary}</Text>
              </Card>
            )}

            {selectedCandidate.questionsAnswers.length > 0 && (
              <Card size="small" title="Questions & Answers">
                <List
                  dataSource={selectedCandidate.questionsAnswers}
                  renderItem={(qa: QuestionAnswer, index) => (
                    <List.Item>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <div>
                          <Tag color={qa.difficulty === 'Easy' ? 'green' : qa.difficulty === 'Medium' ? 'orange' : 'red'}>
                            {qa.difficulty}
                          </Tag>
                          <Tag>Score: {qa.score}/10</Tag>
                          <Tag>Time: {qa.timeSpent}s / {qa.timeLimit}s</Tag>
                        </div>
                        <div>
                          <Text strong>Q{index + 1}: </Text>
                          <Text>{qa.question}</Text>
                        </div>
                        <div>
                          <Text strong>Answer: </Text>
                          <Text>{qa.answer}</Text>
                        </div>
                      </Space>
                    </List.Item>
                  )}
                />
              </Card>
            )}

            {selectedCandidate.chatHistory.length > 0 && (
              <Card size="small" title="Chat History">
                <List
                  dataSource={selectedCandidate.chatHistory}
                  renderItem={(msg) => (
                    <List.Item>
                      <Space>
                        <Tag color={msg.type === 'user' ? 'blue' : msg.type === 'bot' ? 'green' : 'default'}>
                          {msg.type.toUpperCase()}
                        </Tag>
                        <Text style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</Text>
                      </Space>
                    </List.Item>
                  )}
                  style={{ maxHeight: 300, overflowY: 'auto' }}
                />
              </Card>
            )}
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default InterviewerTab;
