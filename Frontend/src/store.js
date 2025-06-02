// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './redux/authSlice';
import studentReducer from './redux/studentSlice';
import teacherReducer from './redux/teacherSlice';
import courseReducer from './redux/courseSlice';
import attendanceReducer from './redux/attendanceSlice';
import resultReducer from './redux/resultSlice';
import leaveReducer from './redux/leaveSlice';
import feedbackReducer from './redux/feedbackSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    students: studentReducer,
    teachers: teacherReducer,
    courses: courseReducer,
    attendance: attendanceReducer,
    results: resultReducer,
    leaves: leaveReducer,
    feedback: feedbackReducer,
  },
});

store.subscribe(() => {
  console.log('Redux store updated:', store.getState());
});

export default store;