import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { fetchProfile } from '../redux/authSlice';

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

// export const fetchResults = createAsyncThunk(
//   'results/fetchResults',
//   async (_, { rejectWithValue, getState }) => {
//     try {
//       const { auth } = getState();
//       const response = await axios.get(`${API_URL}/results/teacher`, {
//         headers: { Authorization: `Bearer ${auth.token}` },
//       });
//       return response.data.results;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch results');
//     }
//   }
// );

export const fetchResults = createAsyncThunk(
  'results/fetchResults',
  async (_, { rejectWithValue, getState, dispatch }) => {
    try {
      const { auth } = getState();
      const currentUser = getState().auth.user;
      console.log('Current user state:', currentUser); // Debug current user state
      if (!currentUser?.role) {
        console.warn('User role is undefined, fetching profile...');
        await dispatch(fetchProfile()).unwrap();
        const updatedUser = getState().auth.user;
        console.log('Updated user state after profile fetch:', updatedUser);
        if (!updatedUser?.role) {
          return rejectWithValue('User role not available after profile fetch');
        }
      }
      console.log('Fetching results for role:', getState().auth.user.role);
      const endpoint = getState().auth.user.role === 'Admin' ? '/results/all' : '/results/teacher';
      const response = await axios.get(`${API_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      console.log('API Response:', response.data);
      return response.data.results || response.data;
    } catch (error) {
      console.error('Fetch Results Error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch results');
    }
  }
);

export const deleteResult = createAsyncThunk(
  'results/deleteResult',
  async (id, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: { Authorization: `Bearer ${auth.token}` },
      };
      const response = await axios.delete(`${API_URL}/results/${id}`, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete result');
    }
  }
);

const resultSlice = createSlice({
  name: 'results',
  initialState: {
    loading: false,
    error: null,
    results: [],
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
        const { _id } = action.payload.result;
        if (_id) {
          const index = state.results.findIndex((r) => r._id === _id);
          if (index !== -1) {
            state.results[index] = action.payload.result;
          } else {
            state.results.push(action.payload.result);
          }
        } else {
          state.results.push(action.payload.result);
        }
      })
      .addCase(submitResult.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        if (action.payload === 'Too many submissions from this user, please try again after an hour') {
          state.error = 'Submission limit reached. Please wait an hour.';
        }
      })
      .addCase(fetchResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResults.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload;
      })
      .addCase(fetchResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteResult.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteResult.fulfilled, (state, action) => {
        state.loading = false;
        state.results = state.results.filter((r) => r._id !== action.meta.arg);
      })
      .addCase(deleteResult.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = resultSlice.actions;
export default resultSlice.reducer;