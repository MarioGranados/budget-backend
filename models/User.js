const mongoose = require('mongoose');
const Expense = require('./Expense'); // Import the Expense model

// Define the User schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  income: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  expenses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expense', // Reference to the Expense model
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create a model from the schema
module.exports = mongoose.model('User', userSchema);
