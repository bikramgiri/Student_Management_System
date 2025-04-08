// config/db.js
require('dotenv').config(); // Load environment variables from .env file
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

async function connectToDatabase() {
  try {
    if (!MONGO_URI) {
      throw new Error('MONGO_URI is not defined in the .env file');
    }

    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1); // Exit the process with failure code if connection fails
  }
}

module.exports = connectToDatabase;