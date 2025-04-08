// src/redux/attendanceSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const fetchStudentsForAttendance = createAsyncThunk(
  'attendance/fetchStudentsForAttendance',
  async (_, { rejectWithValue,dispatch, getState }) => {
    try {
      const { auth } = getState();
      if (!auth.token) {
        console.error('No token found in auth state');
        return rejectWithValue('No authentication token available');
      }
      const response = await axios.get(`${API_URL}/students`);
      return response.data.students;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch students';
      console.error('Fetch students error:', message, error.response?.status); // Enhanced logging
      if (message === 'Unauthorized: Token has expired') {
        dispatch({ type: 'auth/logout' });
        return rejectWithValue('Session expired. Please log in again.');
      }
      return rejectWithValue(message);
    }
  }
);

export const submitAttendance = createAsyncThunk(
  'attendance/submitAttendance',
  async (attendanceData, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      if (!auth.token) {
        return rejectWithValue('No authentication token available');
      }
      const response = await axios.post(`${API_URL}/attendance`, attendanceData); // Use interceptor
      return response.data.attendance;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to submit attendance';
      console.error('Submit attendance error:', message);
      return rejectWithValue(message);
    }
  }
);

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState: {
    students: [],
    attendances: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudentsForAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentsForAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.students = action.payload;
      })
      .addCase(fetchStudentsForAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(submitAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.attendances.unshift(action.payload);
      })
      .addCase(submitAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        if (action.payload === 'Too many submissions from this user, please try again after an hour') {
          state.error = 'Submission limit reached. Please wait an hour.';
        }
      });
  },
});

export const { clearError } = attendanceSlice.actions;
export default attendanceSlice.reducer;