// src/redux/resultSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const submitResult = createAsyncThunk(
  'results/submitResult',
  async (resultData, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: { Authorization: `Bearer ${auth.token}` },
      };
      const response = await axios.post(`${API_URL}/results`, resultData, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit result');
    }
  }
);

const resultSlice = createSlice({
  name: 'results',
  initialState: {
    loading: false,
    error: null,
    results: [], // Store submitted results
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitResult.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitResult.fulfilled, (state, action) => {
        state.loading = false;
        state.results.push(action.payload.result); // Add new result to state
      })
      .addCase(submitResult.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        if (action.payload === 'Too many submissions from this user, please try again after an hour') {
          state.error = 'Submission limit reached. Please wait an hour.';
        }
      });
  },
});

export const { clearError } = resultSlice.actions;
export default resultSlice.reducer;