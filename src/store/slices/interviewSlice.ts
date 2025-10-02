import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface InterviewState {
  currentCandidateId: string | null;
  currentRoomCode: string | null;
  currentQuestionIndex: number;
  isInterviewActive: boolean;
  isPaused: boolean;
  currentAnswer: string;
  timerRemaining: number;
  stage: 'upload' | 'collect-info' | 'interview' | 'completed';
  missingFields: string[];
}

const initialState: InterviewState = {
  currentCandidateId: null,
  currentRoomCode: null,
  currentQuestionIndex: 0,
  isInterviewActive: false,
  isPaused: false,
  currentAnswer: '',
  timerRemaining: 0,
  stage: 'upload',
  missingFields: [],
};

const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    setRoomCode: (state, action: PayloadAction<string>) => {
      state.currentRoomCode = action.payload;
    },
    startInterview: (state, action: PayloadAction<string>) => {
      state.currentCandidateId = action.payload;
      state.isInterviewActive = true;
      state.currentQuestionIndex = 0;
      state.stage = 'interview';
    },
    setStage: (state, action: PayloadAction<InterviewState['stage']>) => {
      state.stage = action.payload;
    },
    setMissingFields: (state, action: PayloadAction<string[]>) => {
      state.missingFields = action.payload;
    },
    nextQuestion: (state) => {
      state.currentQuestionIndex += 1;
      state.currentAnswer = '';
    },
    setCurrentAnswer: (state, action: PayloadAction<string>) => {
      state.currentAnswer = action.payload;
    },
    setTimerRemaining: (state, action: PayloadAction<number>) => {
      state.timerRemaining = action.payload;
    },
    pauseInterview: (state) => {
      state.isPaused = true;
    },
    resumeInterview: (state) => {
      state.isPaused = false;
    },
    completeInterview: (state) => {
      state.isInterviewActive = false;
      state.stage = 'completed';
    },
    resetInterview: () => {
      return initialState;
    },
  },
});

export const {
  setRoomCode,
  startInterview,
  setStage,
  setMissingFields,
  nextQuestion,
  setCurrentAnswer,
  setTimerRemaining,
  pauseInterview,
  resumeInterview,
  completeInterview,
  resetInterview,
} = interviewSlice.actions;

export default interviewSlice.reducer;
