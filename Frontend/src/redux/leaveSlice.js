import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const submitStudentLeave = createAsyncThunk(
  'leaves/submitStudentLeave',
  async (leaveData, { rejectWithValue, getState, dispatch }) => {
    try {
      const { auth } = getState();
      const { data } = await axios.post(`${API_URL}/leaves/student`, leaveData, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      dispatch(fetchAllLeaves());
      return data;
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
      dispatch(fetchAllLeaves());
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit leave');
    }
  }
);

export const fetchAllLeaves = createAsyncThunk(
  'leaves/fetchAllLeaves',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const { role, _id: userId } = getState().auth.user || {};
      const url = role === 'Teacher' ? `${API_URL}/leaves?teacher=${userId}` : `${API_URL}/leaves`;
      const { data } = await axios.get(url, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return data.leaves;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch all leaves');
    }
  }
);

// export const fetchAllLeaves = createAsyncThunk(
//   'leaves/fetchAllLeaves',
//   async (_, { rejectWithValue, getState }) => {
//     try {
//       const { auth } = getState();
//       const { data } = await axios.get(`${API_URL}/leaves`, {
//         headers: { Authorization: `Bearer ${auth.token}` },
//       });
//       return data.leaves;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch all leaves');
//     }
//   }
// );

export const updateLeaveStatus = createAsyncThunk(
  'leaves/updateLeaveStatus',
  async ({ id, status }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const { data } = await axios.put(`${API_URL}/leaves/${id}`, { status }, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return data.leave;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update leave status');
    }
  }
);

export const updateTeacherLeave = createAsyncThunk(
  'leaves/updateTeacherLeave',
  async ({ id, reason }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const { data } = await axios.put(`${API_URL}/leaves/teacher/${id}`, { reason }, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return data.leave;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update leave reason');
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
        state.leaves.push(action.payload.leave);
      })
      .addCase(submitStudentLeave.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(submitTeacherLeave.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitTeacherLeave.fulfilled, (state, action) => {
        state.loading = false;
        state.leaves.push(action.payload.leave);
      })
      .addCase(submitTeacherLeave.rejected, (state, action) => {
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
      .addCase(updateTeacherLeave.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTeacherLeave.fulfilled, (state, action) => {
        state.loading = false;
        const updatedLeave = action.payload;
        state.leaves = state.leaves.map((leave) =>
          leave._id === updatedLeave._id ? updatedLeave : leave
        );
      })
      .addCase(updateTeacherLeave.rejected, (state, action) => {
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