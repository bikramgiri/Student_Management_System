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

export const fetchResults = createAsyncThunk(
  'results/fetchResults',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await axios.get(`${API_URL}/results/student`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return response.data.results;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch results');
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
      })
      .addCase(fetchResults.pending, (state) => { state.loading = true; state.error = null; })
    .addCase(fetchResults.fulfilled, (state, action) => { state.loading = false; state.results = action.payload; })
    .addCase(fetchResults.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { clearError } = resultSlice.actions;
export default resultSlice.reducer;