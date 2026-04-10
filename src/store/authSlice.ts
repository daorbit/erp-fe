import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { IUser } from '../types/auth';

interface AuthState {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

function loadUser(): IUser | null {
  try {
    const stored = localStorage.getItem('user');
    if (!stored) return null;
    const user = JSON.parse(stored);
    // Validate required fields to prevent stale/corrupted data
    if (!user._id || !user.email || !user.role) return null;
    return user;
  } catch {
    return null;
  }
}

const initialState: AuthState = {
  user: loadUser(),
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{ token: string; user: IUser }>,
    ) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.loading = false;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    setUser(state, action: PayloadAction<IUser>) {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },
});

export const { setCredentials, logout, setUser, setLoading } = authSlice.actions;
export default authSlice.reducer;
