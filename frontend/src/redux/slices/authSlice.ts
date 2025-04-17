import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// Types
interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

interface AuthResponse {
  access_token: string;
  user: User;
}

// API base URL
const API_URL = 'http://localhost:3000';

// Helper function to safely access localStorage
const isBrowser = typeof window !== 'undefined';
const getToken = () => isBrowser ? localStorage.getItem('token') : null;
const setToken = (token: string) => {
  if (isBrowser) localStorage.setItem('token', token);
};
const removeToken = () => {
  if (isBrowser) localStorage.removeItem('token');
};

// Async thunks
export const login = createAsyncThunk<AuthResponse, LoginCredentials>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      // Store token in localStorage
      setToken(response.data.access_token);
      return response.data;
    } catch (error: unknown) {
      const err = error as Error & { 
        response?: { 
          data?: { message?: string },
          status?: number 
        }
      };
      return rejectWithValue(
        err.response?.data?.message || 'Failed to login'
      );
    }
  }
);

export const register = createAsyncThunk<AuthResponse, RegisterCredentials>(
  'auth/register',
  async (credentials, { rejectWithValue }) => {
    try {
      await axios.post(`${API_URL}/users`, credentials);
      // After registration, login automatically
      const loginResponse = await axios.post(`${API_URL}/auth/login`, {
        username: credentials.username,
        password: credentials.password,
      });
      setToken(loginResponse.data.access_token);
      return loginResponse.data;
    } catch (error: unknown) {
      const err = error as Error & { 
        response?: { 
          data?: { message?: string },
          status?: number 
        }
      };
      return rejectWithValue(
        err.response?.data?.message || 'Failed to register'
      );
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  removeToken();
  return null;
});

export const loadUser = createAsyncThunk<User | null>(
  'auth/loadUser',
  async (_, { rejectWithValue }) => {
    const token = getToken();
    if (!token) return null;

    try {
      // Set authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await axios.get(`${API_URL}/users/profile`);
      return response.data;
    } catch (error: unknown) {
      const err = error as Error & { 
        response?: { 
          data?: { message?: string },
          status?: number 
        }
      };
      removeToken();
      return rejectWithValue(
        err.response?.data?.message || 'Failed to load user'
      );
    }
  }
);

// Initial state
const initialState: AuthState = {
  user: null,
  token: getToken(),
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.access_token;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.access_token;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      // Load User
      .addCase(loadUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadUser.fulfilled, (state, action: PayloadAction<User | null>) => {
        state.isLoading = false;
        if (action.payload) {
          state.isAuthenticated = true;
          state.user = action.payload;
        } else {
          state.isAuthenticated = false;
        }
      })
      .addCase(loadUser.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer; 