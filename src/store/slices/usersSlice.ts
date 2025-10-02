import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface User {
  userId: string;
  name: string;
  email: string;
  password: string; // In production, this should be hashed
  role: 'interviewee' | 'interviewer';
  createdAt: number;
}

interface UsersState {
  users: User[];
}

const initialState: UsersState = {
  users: [],
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    registerUser: (state, action: PayloadAction<User>) => {
      state.users.push(action.payload);
    },
    getUserByEmail: (state, action: PayloadAction<string>) => {
      // This is just for reference, actual usage will be in selectors
      state.users.find((user) => user.email === action.payload);
    },
  },
});

export const { registerUser } = usersSlice.actions;
export default usersSlice.reducer;
