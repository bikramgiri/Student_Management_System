// src/redux/leaveSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const submitStudentLeave = createAsyncThunk(
  'leaves/submitStudentLeave',
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

export const submitTeacherLeave = createAsyncThunk(
  'leaves/submitTeacherLeave',
  async (leaveData, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await axios.post(`${API_URL}/leaves/teacher`, leaveData, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      console.log('submitTeacherLeave response:', response.data); // Debug log
      return response.data.leave;
    } catch (error) {
      console.error('submitTeacherLeave error:', error.response?.data);
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
      .addCase(submitStudentLeave.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitStudentLeave.fulfilled, (state, action) => {
        state.loading = false;
        state.leaves.push(action.payload);
      })
      .addCase(submitStudentLeave.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add cases for submitTeacherLeave
      .addCase(submitTeacherLeave.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitTeacherLeave.fulfilled, (state, action) => {
        state.loading = false;
        state.leaves.push(action.payload);
      })
      .addCase(submitTeacherLeave.rejected, (state, action) => {
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