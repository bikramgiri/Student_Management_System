// src/redux/leaveSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const submitStudentLeave = createAsyncThunk(
  'leaves/submitStudentLeave',
  async (leaveData, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const { data } = await axios.post(`${API_URL}/leaves`, leaveData, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return data.leave; // Return only the leave object
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit leave');
    }
  }
);

export const submitTeacherLeave = createAsyncThunk(
  'leaves/submitTeacherLeave',
  async (leaveData, { rejectWithValue, getState, dispatch }) => {
    try {
      const { auth } = getState();
      const { data } = await axios.post(`${API_URL}/leaves/teacher`, leaveData, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      console.log('submitTeacherLeave response:', data);
      dispatch(fetchAllLeaves());
      return data.leave; // Return only the leave object
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
      const { data } = await axios.get(`${API_URL}/leaves/student`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return data.leaves;
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
      const { data } = await axios.get(`${API_URL}/leaves`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      console.log('Fetched leaves:', data.leaves);
      return data.leaves;
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
      const { data } = await axios.put(`${API_URL}/leaves/${id}`, { status }, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return data.leave; // Return only the updated leave object
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update leave status');
    }
  }
);

export const deleteLeave = createAsyncThunk(
  'leaves/deleteLeave',
  async (id, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      await axios.delete(`${API_URL}/leaves/${id}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete leave');
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
      .addCase(submitTeacherLeave.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitTeacherLeave.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
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
      })
      .addCase(deleteLeave.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteLeave.fulfilled, (state, action) => {
        state.loading = false;
        state.leaves = state.leaves.filter((leave) => leave._id !== action.payload);
      })
      .addCase(deleteLeave.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default leaveSlice.reducer;