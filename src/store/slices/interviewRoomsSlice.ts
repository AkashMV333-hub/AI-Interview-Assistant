import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface InterviewRoom {
  roomId: string;
  roomCode: string;
  interviewerId: string;
  interviewerName: string;
  title: string;
  candidateIds: string[];
  createdAt: number;
  isActive: boolean;
}

interface InterviewRoomsState {
  rooms: InterviewRoom[];
}

const initialState: InterviewRoomsState = {
  rooms: [],
};

const interviewRoomsSlice = createSlice({
  name: 'interviewRooms',
  initialState,
  reducers: {
    createRoom: (state, action: PayloadAction<InterviewRoom>) => {
      state.rooms.push(action.payload);
    },
    addCandidateToRoom: (state, action: PayloadAction<{ roomCode: string; candidateId: string }>) => {
      const room = state.rooms.find((r) => r.roomCode === action.payload.roomCode);
      if (room && !room.candidateIds.includes(action.payload.candidateId)) {
        room.candidateIds.push(action.payload.candidateId);
      }
    },
    deactivateRoom: (state, action: PayloadAction<string>) => {
      const room = state.rooms.find((r) => r.roomCode === action.payload);
      if (room) {
        room.isActive = false;
      }
    },
  },
});

export const { createRoom, addCandidateToRoom, deactivateRoom } = interviewRoomsSlice.actions;
export default interviewRoomsSlice.reducer;
