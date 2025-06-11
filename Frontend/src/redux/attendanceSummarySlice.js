import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const fetchAttendanceSummary = createAsyncThunk(
  'attendanceSummary/fetchAttendanceSummary',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const today = new Date().toLocaleDateString(); // e.g., "6/10/2025"
      const response = await axios.get(`${API_URL}/api/attendance/summary?date=${today}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch attendance summary');
    }
  }
);

const attendanceSummarySlice = createSlice({
  name: 'attendanceSummary',
  initialState: {
    data: { present: 0, absent: 0, late: 0 },
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