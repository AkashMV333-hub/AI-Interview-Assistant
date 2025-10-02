import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface Message {
  id: string;
  type: 'user' | 'bot' | 'system';
  content: string;
  timestamp: number;
}

export interface QuestionAnswer {
  questionId: string;
  question: string;
  answer: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeLimit: number;
  timeSpent: number;
  score: number;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  resumeText: string;
  resumeFile?: {
    name: string;
    type: string;
    data: string; // Base64 encoded file data
  };
  profileDescription?: string;
  status: 'pending' | 'in-progress' | 'completed';
  chatHistory: Message[];
  questionsAnswers: QuestionAnswer[];
  finalScore: number;
  summary: string;
  createdAt: number;
  updatedAt: number;
}

interface CandidatesState {
  candidates: Candidate[];
}

const initialState: CandidatesState = {
  candidates: [],
};

const candidatesSlice = createSlice({
  name: 'candidates',
  initialState,
  reducers: {
    addCandidate: (state, action: PayloadAction<Candidate>) => {
      state.candidates.push(action.payload);
    },
    updateCandidate: (state, action: PayloadAction<{ id: string; updates: Partial<Candidate> }>) => {
      const index = state.candidates.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) {
        state.candidates[index] = { ...state.candidates[index], ...action.payload.updates };
      }
    },
    addMessageToCandidate: (state, action: PayloadAction<{ candidateId: string; message: Message }>) => {
      const candidate = state.candidates.find((c) => c.id === action.payload.candidateId);
      if (candidate) {
        candidate.chatHistory.push(action.payload.message);
      }
    },
    addQuestionAnswer: (state, action: PayloadAction<{ candidateId: string; qa: QuestionAnswer }>) => {
      const candidate = state.candidates.find((c) => c.id === action.payload.candidateId);
      if (candidate) {
        candidate.questionsAnswers.push(action.payload.qa);
      }
    },
  },
});

export const { addCandidate, updateCandidate, addMessageToCandidate, addQuestionAnswer } = candidatesSlice.actions;
export default candidatesSlice.reducer;
