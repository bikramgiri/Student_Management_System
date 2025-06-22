const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Name is required'], 
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'], 
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false,
  },
  role: { 
    type: String, 
    enum: {
      values: ['Admin', 'Teacher', 'Student'],
      message: 'Role must be Admin, Teacher, or Student',
    },
    default: 'Student',
    required: [true, 'Role is required'],
  },
  address: { type: String, trim: true }, // Added address
  subjects: { // New field for teachers
    type: [String],
    required: function() { return this.role === 'Teacher'; }, // Required only for teachers
    default: [],
    validate: {
      validator: function(v) {
        return this.role === 'Teacher' ? v.length > 0 : true; // Ensure at least one subject for teachers
      },
      message: 'Teachers must have at least one subject',
    },
  },
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});


// Add compound index on email and role
userSchema.index({ email: 1, role: 1 }, { unique: true });

// Virtuals for related profiles
userSchema.virtual('studentProfile', {
  ref: 'Student',
  localField: '_id',
  foreignField: 'user',
  justOne: true,
});

userSchema.virtual('teacherProfile', {
  ref: 'Teacher',
  localField: '_id',
  foreignField: 'user',
  justOne: true,
});

// **Pre-save hook to hash password with error handling
// userSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) return next();
//   try {
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

// **OR

userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// **Method to compare passwords
// userSchema.methods.comparePassword = async function (candidatePassword) {
//   return await bcrypt.compare(candidatePassword, this.password);
// };

// **OR

userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);