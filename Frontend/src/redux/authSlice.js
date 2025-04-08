// src/redux/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Set up Axios interceptor to add token to headers
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const signupUser = createAsyncThunk(
  'auth/signupUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/signup`, userData);
      return response.data;
    } catch (error) {
      const errorDetails = error.response?.data || { message: 'Signup failed' };
      console.error('Signup error:', errorDetails); // Improved logging
      return rejectWithValue(errorDetails.message);
    }
  }
);

export const fetchPotentialTeachers = createAsyncThunk(
  'auth/fetchPotentialTeachers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/teachers/potential`);
      return response.data.potentialTeachers; // Adjust based on backend response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch potential teachers');
    }
  }
);

export const fetchPotentialStudents = createAsyncThunk(
  'auth/fetchPotentialStudents',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/students/potential`);
      return response.data.potentialStudents; // Matches studentController.js
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch potential students');
    }
  }
);

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  potentialTeachers: [],
  potentialStudents: [],
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.potentialTeachers = [];
      state.potentialStudents = [];
      state.loading = false;
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchPotentialTeachers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPotentialTeachers.fulfilled, (state, action) => {
        state.loading = false;
        state.potentialTeachers = action.payload;
      })
      .addCase(fetchPotentialTeachers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchPotentialStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPotentialStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.potentialStudents = action.payload;
      })
      .addCase(fetchPotentialStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;