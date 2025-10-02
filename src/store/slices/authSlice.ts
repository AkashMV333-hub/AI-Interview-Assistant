import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type UserRole = 'interviewee' | 'interviewer' | null;

interface AuthState {
  isAuthenticated: boolean;
  role: UserRole;
  userEmail: string;
  userName: string;
}

const initialState: AuthState = {
  isAuthenticated: false,
  role: null,
  userEmail: '',
  userName: '',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ role: UserRole; email: string; name: string }>) => {
      state.isAuthenticated = true;
      state.role = action.payload.role;
      state.userEmail = action.payload.email;
      state.userName = action.payload.name;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.role = null;
      state.userEmail = '';
      state.userName = '';
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
