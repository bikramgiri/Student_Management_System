import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const fetchAttendanceSummary = createAsyncThunk(
  'attendanceSummary/fetchAttendanceSummary',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const { role } = getState().auth.user || {};
      const today = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }); // Current date: "6/19/2025"
      const endpoint = role === 'Admin' ? '/api/attendance/summary/admin' : '/api/attendance/summary';
      const response = await axios.get(`${API_URL}${endpoint}?date=${today}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      console.log('API Response:', response.data); // Debug log
      if (!response.data || typeof response.data !== 'object' || (!('present' in response.data) && !('absent' in response.data))) {
        throw new Error('Invalid attendance summary data');
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching attendance summary:', error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch attendance summary');
    }
  }
);

const attendanceSummarySlice = createSlice({
  name: 'attendanceSummary',
  initialState: {
    data: { present: 0, absent: 0 },
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAttendanceSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttendanceSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchAttendanceSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default attendanceSummarySlice.reducer;