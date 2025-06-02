// src/redux/leaveSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const submitLeave = createAsyncThunk(
  'leaves/submitLeave',
  async (leaveData, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await axios.post(`${API_URL}/leaves`, leaveData, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return response.data.leave;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit leave');
    }
  }
);

export const fetchLeaves = createAsyncThunk(
  'leaves/fetchLeaves',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await axios.get(`${API_URL}/leaves/student`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return response.data.leaves;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch leaves');
    }
  }
);

export const fetchAllLeaves = createAsyncThunk(
  'leaves/fetchAllLeaves',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await axios.get(`${API_URL}/leaves`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return response.data.leaves;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch all leaves');
    }
  }
);

export const updateLeaveStatus = createAsyncThunk(
  'leaves/updateLeaveStatus',
  async ({ id, status }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await axios.put(`${API_URL}/leaves/${id}`, { status }, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return response.data.leave;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update leave status');
    }
  }
);

const leaveSlice = createSlice({
  name: 'leaves',
  initialState: {
    leaves: [],
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
      .addCase(submitLeave.fulfilled, (state, action) => {
        state.loading = false;
        state.leaves.push(action.payload);
      })
      .addCase(submitLeave.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchLeaves.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeaves.fulfilled, (state, action) => {
        state.loading = false;
        state.leaves = action.payload;
      })
      .addCase(fetchLeaves.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAllLeaves.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllLeaves.fulfilled, (state, action) => {
        state.loading = false;
        state.leaves = action.payload;
      })
      .addCase(fetchAllLeaves.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateLeaveStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLeaveStatus.fulfilled, (state, action) => {
        state.loading = false;
        const updatedLeave = action.payload;
        state.leaves = state.leaves.map((leave) =>
          leave._id === updatedLeave._id ? updatedLeave : leave
        );
      })
      .addCase(updateLeaveStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default leaveSlice.reducer;