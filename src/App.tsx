import { ConfigProvider, App as AntApp } from 'antd';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { store, persistor } from './store/store';
import RoleSelection from './components/RoleSelection';
import SignupInterviewee from './components/SignupInterviewee';
import SignupInterviewer from './components/SignupInterviewer';
import LoginInterviewee from './components/LoginInterviewee';
import LoginInterviewer from './components/LoginInterviewer';
import ProtectedRoute from './components/ProtectedRoute';
import JoinInterviewRoom from './components/JoinInterviewRoom';
import IntervieweeTab from './components/IntervieweeTab';
import InterviewerRoomDashboard from './components/InterviewerRoomDashboard';
import InterviewerTab from './components/InterviewerTab';
import WelcomeBackModal from './components/WelcomeBackModal';
import AuthCheck from './components/AuthCheck';
import './App.css';

function AppContent() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
        },
      }}
    >
      <AntApp>
        <BrowserRouter>
          <AuthCheck />
          <WelcomeBackModal />
          <Routes>
            <Route path="/" element={<RoleSelection />} />
            <Route path="/signup/interviewee" element={<SignupInterviewee />} />
            <Route path="/signup/interviewer" element={<SignupInterviewer />} />
            <Route path="/login/interviewee" element={<LoginInterviewee />} />
            <Route path="/login/interviewer" element={<LoginInterviewer />} />

            {/* Interviewee routes */}
            <Route
              path="/join-room"
              element={
                <ProtectedRoute allowedRole="interviewee">
                  <JoinInterviewRoom />
                </ProtectedRoute>
              }
            />
            <Route
              path="/join/:roomCode"
              element={
                <ProtectedRoute allowedRole="interviewee">
                  <JoinInterviewRoom />
                </ProtectedRoute>
              }
            />
            <Route
              path="/interviewee"
              element={
                <ProtectedRoute allowedRole="interviewee">
                  <IntervieweeTab />
                </ProtectedRoute>
              }
            />

            {/* Interviewer routes */}
            <Route
              path="/interviewer/rooms"
              element={
                <ProtectedRoute allowedRole="interviewer">
                  <InterviewerRoomDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/interviewer/:roomCode"
              element={
                <ProtectedRoute allowedRole="interviewer">
                  <InterviewerTab />
                </ProtectedRoute>
              }
            />
            <Route
              path="/interviewer"
              element={
                <ProtectedRoute allowedRole="interviewer">
                  <InterviewerTab />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  );
}

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppContent />
      </PersistGate>
    </Provider>
  );
}

export default App;
