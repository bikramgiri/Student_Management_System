require('dotenv').config();
const express = require('express');
const connectToDatabase = require('./config/db');
const cors = require('cors');
const authMiddleware = require('./middleware/authMiddleware'); // Import middleware

// Import Routes
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes'); // Add this
const resultRoutes = require('./routes/resultRoutes'); // Add this
const leaveRoutes = require('./routes/leaveRoutes'); // Add this

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// **For Local Host
// app.use(cors({ origin: process.env.FRONTEND_URL, 
//   credentials: true // If your frontend sends cookies or auth headers
//   }));

// **For Production
// Define allowed origins
const allowedOrigins = [
  process.env.FRONTEND_URL, // For local development
  process.env.ONLINE_URL // For production
];
// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Allow cookies/auth headers if needed
}));


// Connect to MongoDB
connectToDatabase();

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: "Welcome to the Student Management System API",
    endpoints: { 
      auth: "/auth", 
      students: "/students", 
      teachers: "/teachers", 
      subjects: "/subjects",
      attendance: "/attendance",
      results: "/results",
      leaves: "/leaves",
      attendanceSummary: "/api/attendance/summary",
      resultSummary: "/api/results/average-marks"
    },
  });
});

// Mount Routes
app.use('/auth', authRoutes); // Unprotected
app.use('/students', authMiddleware, studentRoutes); // Protected
app.use('/teachers', authMiddleware, teacherRoutes); // Protected
app.use('/subjects', authMiddleware, subjectRoutes);   // Protected
app.use('/attendance', authMiddleware, attendanceRoutes); // Protected
app.use('/results', authMiddleware, resultRoutes);       // Protected
app.use('/leaves', authMiddleware, leaveRoutes);         // Protected
app.use('/api/attendance', authMiddleware, attendanceRoutes); 
app.use('/api/results', authMiddleware, resultRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});