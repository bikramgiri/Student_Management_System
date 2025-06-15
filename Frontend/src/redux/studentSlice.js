import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const fetchStudents = createAsyncThunk(
  'students/fetchStudents',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await axios.get(`${API_URL}/students`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return response.data.students; // Expect { students: [...] }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch students');
    }
  }
);

export const addStudent = createAsyncThunk(
  'students/addStudent',
  async ({ userData, enrollmentNumber, class: className, section }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();

      // Log the data before sending
      console.log('Attempting to sign up user with data:', JSON.stringify(userData, null, 2));

      // Step 1: Create new user via signup (no Authorization header)
      const signupResponse = await axios.post(`${API_URL}/auth/signup`, userData);
      console.log('Signup response received:', JSON.stringify(signupResponse.data, null, 2));

      if (!signupResponse.data.user || !signupResponse.data.user._id) {
        throw new Error('Invalid user ID from signup response');
      }

      // Step 2: Create student record with the new user ID
      const studentData = {
        user: signupResponse.data.user._id,
        enrollmentNumber,
        class: className || '',
        section: section || '',
      };
      console.log('Attempting to add student with data:', JSON.stringify(studentData, null, 2));

      const studentResponse = await axios.post(`${API_URL}/students`, studentData, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      return studentResponse.data.student;
    } catch (error) {
      console.error('Add student error details:', {
        data: error.response?.data,
        status: error.response?.status,
        stack: error.stack,
      });
      return rejectWithValue(error.response?.data?.message || 'Failed to add student');
    }
  }
);

export const deleteStudent = createAsyncThunk(
  'students/deleteStudent',
  async (studentId, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      await axios.delete(`${API_URL}/students/${studentId}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return studentId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete student');
    }
  }
);

export const updateStudent = createAsyncThunk(
  'students/updateStudent',
  async (studentData, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const { _id, userId, name, email, password, address, enrollmentNumber, class: className, section } = studentData;
      if (name || email || password || address) {
        const updateUserData = {};
        if (name) updateUserData.name = name;
        if (email) updateUserData.email = email;
        if (password) updateUserData.password = password;
        if (address) updateUserData.address = address;
        await axios.put(`${API_URL}/auth/${userId}`, updateUserData, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
      }
      const studentResponse = await axios.put(`${API_URL}/students/${_id}`, {
        enrollmentNumber,
        class: className,
        section,
        address,
      }, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return studentResponse.data.student;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update student');
    }
  }
);

const studentSlice = createSlice({
  name: 'students',
  initialState: { students: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudents.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchStudents.fulfilled, (state, action) => { state.loading = false; state.students = action.payload; })
      .addCase(fetchStudents.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(addStudent.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(addStudent.fulfilled, (state, action) => { state.loading = false; state.students.push(action.payload); })
      .addCase(addStudent.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(deleteStudent.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(deleteStudent.fulfilled, (state, action) => { 
        state.loading = false; 
        state.students = state.students.filter((stu) => stu._id !== action.payload); 
      })
      .addCase(deleteStudent.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(updateStudent.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateStudent.fulfilled, (state, action) => { 
        state.loading = false; 
        const index = state.students.findIndex(stu => stu._id === action.payload._id);
        if (index !== -1) state.students[index] = action.payload;
      })
      .addCase(updateStudent.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export default studentSlice.reducer;