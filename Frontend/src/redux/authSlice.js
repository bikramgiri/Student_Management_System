import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Set up Axios interceptor to add token to headers
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const signupUser = createAsyncThunk(
  'auth/signupUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/signup`, userData);
      return response.data; // Returns token and user data
    } catch (error) {
      const errorDetails = error.response?.data || { message: 'Signup failed' };
      console.error('Signup error:', errorDetails); // Improved logging
      return rejectWithValue(errorDetails.message);
    }
  }
);

export const fetchPotentialTeachers = createAsyncThunk(
  'auth/fetchPotentialTeachers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/teachers/potential`);
      return response.data.potentialTeachers; // Adjust based on backend response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch potential teachers');
    }
  }
);

export const fetchPotentialStudents = createAsyncThunk(
  'auth/fetchPotentialStudents',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/students/potential`);
      return response.data.potentialStudents; // Matches studentController.js
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch potential students');
    }
  }
);

// **fetch profile for all role
export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await axios.get(`${API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      localStorage.setItem('user', JSON.stringify(response.data.user)); // Sync localStorage
      console.log('Profile fetched:', response.data.user); // Debug log
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

// **update profile for all role
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (formData, { rejectWithValue, getState, dispatch }) => {
    try {
      const { auth } = getState();
      const response = await axios.put(`${API_URL}/auth/profile`, formData, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      // After a successful update, dispatch fetchProfile to refresh the auth state
      dispatch(fetchProfile());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

// export const updateProfile = createAsyncThunk(
//   'auth/updateProfile',
//   async (formData, { rejectWithValue, getState }) => {
//     try {
//       const { auth } = getState();
//       const response = await axios.put(`${API_URL}/auth/profile`, formData, {
//         headers: { Authorization: `Bearer ${auth.token}` },
//       });
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
//     }
//   }
// );

// export const fetchAdminProfile = createAsyncThunk(
//   'auth/fetchAdminProfile',
//   async (_, { rejectWithValue, getState }) => {
//     try {
//       const { auth } = getState();
//       const response = await axios.get(`${API_URL}/auth/profile`, {
//         headers: { Authorization: `Bearer ${auth.token}` },
//       });
//       return response.data.user;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
//     }
//   }
// );

// export const updateAdminProfile = createAsyncThunk(
//   'auth/updateAdminProfile',
//   async (formData, { rejectWithValue, getState }) => {
//     try {
//       const { auth } = getState();
//       const response = await axios.put(`${API_URL}/auth/profile`, formData, {
//         headers: { Authorization: `Bearer ${auth.token}` },
//       });
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
//     }
//   }
// );

// export const fetchTeacherProfile = createAsyncThunk(
//   'auth/fetchTeacherProfile',
//   async (_, { rejectWithValue, getState }) => {
//     try {
//       const { auth } = getState();
//       const response = await axios.get(`${API_URL}/auth/profile`, {
//         headers: { Authorization: `Bearer ${auth.token}` },
//       });
//       return response.data.user;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
//     }
//   }
// );

// export const updateTeacherProfile = createAsyncThunk(
//   'auth/updateTeacherProfile',
//   async (formData, { rejectWithValue, getState }) => {
//     try {
//       const { auth } = getState();
//       const response = await axios.put(`${API_URL}/auth/profile`, formData, {
//         headers: { Authorization: `Bearer ${auth.token}` },
//       });
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
//     }
//   }
// );

// **fetch subjects for teacher (new action)
// export const fetchSubjects = createAsyncThunk(
//   'subjects/fetchSubjects',
//   async (_, { rejectWithValue, getState }) => {
//     try {
//       const { auth } = getState();
//       const response = await axios.get(`${API_URL}/subjects`, {
//         headers: { Authorization: `Bearer ${auth.token}` },
//       });
//       return response.data.subjects;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch subjects');
//     }
//   }
// );

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  potentialTeachers: [],
  potentialStudents: [],
  loading: false,
  error: null,
  theme: localStorage.getItem('theme') || 'light',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.potentialTeachers = [];
      state.potentialStudents = [];
      state.loading = false;
      state.error = null;
      state.theme = 'light';
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.setItem('theme', 'light');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.theme = action.payload.user.theme || 'light';
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
        localStorage.setItem('theme', state.theme);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state) => {
        state.loading = false;
        // Do not update state.user or state.token here, as this is for creating a new teacher, not logging in
        // Return the new user data for use in ManageTeachers without affecting the current session
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchPotentialTeachers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPotentialTeachers.fulfilled, (state, action) => {
        state.loading = false;
        state.potentialTeachers = action.payload;
      })
      .addCase(fetchPotentialTeachers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchPotentialStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPotentialStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.potentialStudents = action.payload;
      })
      .addCase(fetchPotentialStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.theme = action.payload.theme || 'light';
        localStorage.setItem('user', JSON.stringify(action.payload));
        localStorage.setItem('theme', state.theme);
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.theme = action.payload.user.theme || 'light';
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
        localStorage.setItem('theme', state.theme);
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;