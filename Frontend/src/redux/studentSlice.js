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
  async (studentData, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await axios.post(`${API_URL}/students`, studentData, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return response.data.student; // Expect { student: {...} }
    } catch (error) {
      console.error('Add student error:', error.response?.data, error.response?.status, error.stack);
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
      .addCase(deleteStudent.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export default studentSlice.reducer;