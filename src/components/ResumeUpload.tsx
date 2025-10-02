import { useState } from 'react';
import { Upload, Button, Card, Typography, App } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { useAppDispatch } from '../store/hooks';
import { addCandidate } from '../store/slices/candidatesSlice';
import { setStage, setMissingFields, startInterview } from '../store/slices/interviewSlice';
import { parseResume } from '../utils/resumeParser';
import { generateProfileDescription } from '../utils/aiService';
import type { Candidate } from '../store/slices/candidatesSlice';

const { Dragger } = Upload;
const { Title, Paragraph } = Typography;

const ResumeUpload = () => {
  const [uploading, setUploading] = useState(false);
  const dispatch = useAppDispatch();
  const { message } = App.useApp();

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

      dispatch(addCandidate(newCandidate));

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
    <Card style={{ maxWidth: 600, margin: '0 auto' }}>
      <Title level={2} style={{ textAlign: 'center' }}>
        AI Interview Assistant
      </Title>
      <Paragraph style={{ textAlign: 'center', marginBottom: 32 }}>
        Upload your resume to begin the interview process
      </Paragraph>
      <Dragger {...uploadProps} disabled={uploading}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Click or drag resume to this area to upload</p>
        <p className="ant-upload-hint">
          Supports PDF and DOCX files only. Your resume will be analyzed to extract contact information.
        </p>
      </Dragger>
      {uploading && (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Button type="primary" loading>
            Processing Resume...
          </Button>
        </div>
      )}
    </Card>
  );
};

export default ResumeUpload;
