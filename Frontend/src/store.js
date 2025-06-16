// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './redux/authSlice';
import studentReducer from './redux/studentSlice';
import teacherReducer from './redux/teacherSlice';
import subjectReducer from './redux/subjectSlice';
import attendanceReducer from './redux/attendanceSlice';
import resultReducer from './redux/resultSlice';
import leaveReducer from './redux/leaveSlice';
import feedbackReducer from './redux/feedbackSlice';
import attendanceSummaryReducer from './redux/attendanceSummarySlice';
import resultsSummaryReducer from './redux/resultsSummarySlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    students: studentReducer,
    teachers: teacherReducer,
    subjects: subjectReducer,
    attendance: attendanceReducer,
    results: resultReducer,
    leaves: leaveReducer,
    feedback: feedbackReducer,
    attendanceSummary: attendanceSummaryReducer,
    resultsSummary: resultsSummaryReducer,
  },
});

store.subscribe(() => {
  console.log('Redux store updated:', store.getState());
});

export default store;