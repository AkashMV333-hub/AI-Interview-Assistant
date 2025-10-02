import { useState } from 'react';
import { Upload, Button, Card, Typography, App } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addCandidate } from '../store/slices/candidatesSlice';
import { setStage, setMissingFields, startInterview } from '../store/slices/interviewSlice';
import { parseResume } from '../utils/resumeParser';
import { generateProfileDescription } from '../utils/aiService';
import { candidatesAPI } from '../services/api';
import type { Candidate } from '../store/slices/candidatesSlice';

const { Dragger } = Upload;
const { Title, Paragraph, Text } = Typography;

const ResumeUpload = () => {
  const [uploading, setUploading] = useState(false);
  const dispatch = useAppDispatch();
  const { message } = App.useApp();
  const currentRoomCode = useAppSelector((state) => state.interview.currentRoomCode);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const parsedData = await parseResume(file);

      // Convert file to base64
      const fileData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Generate profile description from resume text (optional - don't block on failure)
      let profileDescription = '';
      try {
        profileDescription = await generateProfileDescription(parsedData.text);
      } catch (error) {
        console.log('Profile description generation failed, continuing without it:', error);
        // Continue without profile description
      }

      // Create new candidate
      const newCandidate: Candidate = {
        id: `candidate-${Date.now()}`,
        name: parsedData.name,
        email: parsedData.email,
        phone: parsedData.phone,
        resumeText: parsedData.text,
        resumeFile: {
          name: file.name,
          type: file.type,
          data: fileData,
        },
        profileDescription,
        status: 'pending',
        chatHistory: [],
        questionsAnswers: [],
        finalScore: 0,
        summary: '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Save candidate to Redux (for local state)
      dispatch(addCandidate(newCandidate));

      // Save candidate to backend
      if (currentRoomCode) {
        try {
          await candidatesAPI.createCandidate({
            id: newCandidate.id,
            roomCode: currentRoomCode,
            name: parsedData.name,
            email: parsedData.email,
            phone: parsedData.phone,
            resumeText: parsedData.text,
            resumeFile: {
              name: file.name,
              type: file.type,
              data: fileData,
            },
            profileDescription,
          });
        } catch (error) {
          console.error('Failed to save candidate to backend:', error);
          message.warning('Resume uploaded but failed to save to server. Please try again.');
        }
      }

      // Check for missing fields
      const missing: string[] = [];
      if (!parsedData.name) missing.push('name');
      if (!parsedData.email) missing.push('email');
      if (!parsedData.phone) missing.push('phone');

      if (missing.length > 0) {
        dispatch(setMissingFields(missing));
        dispatch(setStage('collect-info'));
      } else {
        dispatch(setStage('interview'));
      }

      // Set current candidate ID
      dispatch(startInterview(newCandidate.id));

      message.success('Resume uploaded successfully!');
    } catch (error: any) {
      message.error(error.message || 'Failed to parse resume');
    } finally {
      setUploading(false);
    }

    return false; // Prevent auto upload
  };

  const uploadProps = {
    name: 'file',
    multiple: false,
    accept: '.pdf,.docx',
    beforeUpload: handleUpload,
    showUploadList: false,
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 200px)',
      background: 'transparent',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Card style={{
        maxWidth: 700,
        width: '100%',
        borderRadius: '0',
        boxShadow: 'none',
        border: '1px solid #e0e0e0'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '32px',
          padding: '24px',
          background: '#0f62fe',
          marginTop: '-24px',
          marginLeft: '-24px',
          marginRight: '-24px'
        }}>
          <Title level={2} style={{ color: '#ffffff', margin: 0, marginBottom: '8px' }}>
            AI Interview Assistant
          </Title>
          <Paragraph style={{ color: '#ffffff', margin: 0, fontSize: '16px' }}>
            Upload your resume to begin the interview process
          </Paragraph>
        </div>

        <Dragger
          {...uploadProps}
          disabled={uploading}
          style={{
            background: '#ffffff',
            borderRadius: '0',
            border: '2px dashed #0f62fe',
            padding: '40px 20px'
          }}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined style={{ color: '#0f62fe', fontSize: '48px' }} />
          </p>
          <p className="ant-upload-text" style={{ fontSize: '16px', fontWeight: '600', color: '#161616' }}>
            Click or drag resume to this area to upload
          </p>
          <p className="ant-upload-hint" style={{ fontSize: '14px', color: '#525252' }}>
            Supports PDF and DOCX files only. Your resume will be analyzed using AI to extract contact information.
          </p>
        </Dragger>

        {uploading && (
          <div style={{
            textAlign: 'center',
            marginTop: 24,
            padding: '16px',
            background: '#d0e2ff',
            border: '1px solid #0f62fe'
          }}>
            <Text style={{ color: '#161616', fontSize: '14px', fontWeight: '600' }}>
              Processing Resume...
            </Text>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ResumeUpload;
