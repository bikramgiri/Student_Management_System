import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const fetchStudentsForAttendance = createAsyncThunk(
  'attendance/fetchStudentsForAttendance',
  async (_, { rejectWithValue, dispatch, getState }) => {
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
      console.error('Fetch students error:', message, error.response?.status);
      if (message === 'Unauthorized: Token has expired') {
        dispatch({ type: 'auth/logout' });
        return rejectWithValue('Session expired. Please log in again.');
      }
      return rejectWithValue(message);
    }
  }
);

export const fetchAttendanceRecords = createAsyncThunk(
  'attendance/fetchAttendanceRecords',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await axios.get(`${API_URL}/attendance/teacher`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return response.data.attendance;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch attendance records');
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
      const response = await axios.post(`${API_URL}/attendance`, attendanceData, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to submit attendance';
      console.error('Submit attendance error:', message);
      return rejectWithValue(message);
    }
  }
);

export const updateAttendance = createAsyncThunk(
  'attendance/updateAttendance',
  async ({ attId, studentId, status }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await axios.put(`${API_URL}/attendance/${attId}`, { studentId, status }, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return response.data.attendance;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update attendance');
    }
  }
);

export const deleteAttendance = createAsyncThunk(
  'attendance/deleteAttendance',
  async (attId, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      await axios.delete(`${API_URL}/attendance/${attId}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return attId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete attendance');
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
      .addCase(fetchAttendanceRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttendanceRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.attendances = action.payload;
      })
      .addCase(fetchAttendanceRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(submitAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.attendances.unshift(action.payload.attendance);
      })
      .addCase(submitAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateAttendance.fulfilled, (state, action) => {
        const updatedAttendance = action.payload;
        const index = state.attendances.findIndex((att) => att._id === updatedAttendance._id);
        if (index !== -1) {
          state.attendances[index] = updatedAttendance;
        }
      })
      .addCase(deleteAttendance.fulfilled, (state, action) => {
        state.attendances = state.attendances.filter((att) => att._id !== action.payload);
      });
  },
});

export const { clearError } = attendanceSlice.actions;
export default attendanceSlice.reducer;