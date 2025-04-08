// src/redux/leaveSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const submitLeave = createAsyncThunk(
  'leaves/submitLeave',
  async (leaveData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/leaves`, leaveData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit leave');
    }
  }
);

const leaveSlice = createSlice({
  name: 'leaves',
  initialState: {
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(submitLeave.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitLeave.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(submitLeave.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default leaveSlice.reducer;