import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const submitFeedback = createAsyncThunk(
  'feedback/submitFeedback',
  async (feedbackData, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await axios.post(`${API_URL}/feedback`, feedbackData, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return response.data.feedback; // Expect { feedback: {...} }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit feedback');
    }
  }
);

export const updateFeedbackStatus = createAsyncThunk(
  'feedback/updateFeedbackStatus',
  async ({ id, status }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await axios.put(`${API_URL}/feedback/${id}`, { status }, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return response.data.feedback; // Expect { feedback: {...} }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update feedback status');
    }
  }
);

export const fetchFeedbacks = createAsyncThunk(
  'feedback/fetchFeedbacks',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await axios.get(`${API_URL}/feedback`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return response.data.feedbacks; // Expect { feedbacks: [...] }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch feedbacks');
    }
  }
);

const feedbackSlice = createSlice({
  name: 'feedback',
  initialState: {
    feedbacks: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(submitFeedback.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitFeedback.fulfilled, (state, action) => {
        state.loading = false;
        state.feedbacks.push(action.payload);
      })
      .addCase(submitFeedback.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateFeedbackStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateFeedbackStatus.fulfilled, (state, action) => {
        state.loading = false;
        const updatedFeedback = action.payload;
        state.feedbacks = state.feedbacks.map((fb) =>
          fb._id === updatedFeedback._id ? updatedFeedback : fb
        );
      })
      .addCase(updateFeedbackStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchFeedbacks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeedbacks.fulfilled, (state, action) => {
        state.loading = false;
        state.feedbacks = action.payload;
      })
      .addCase(fetchFeedbacks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default feedbackSlice.reducer;