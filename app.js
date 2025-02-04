const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const userRoutes = require('./routes/userRoute')
const expensesRoutes = require('./routes/expenseRoute')
const cors = require("cors");


const app = express();

// Enable CORS for your front-end app (React running on http://localhost:3001)
app.use(
  cors({
    origin: "http://localhost:3001", // Your React front-end URL change in production
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed methods
    credentials: true, // If you're using cookies, set this to true
  })
);

app.use(express.json());

// MongoDB Connection
const mongoURI = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_CLUSTER}/?retryWrites=true&w=majority`;

mongoose.connect(mongoURI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("Failed to connect to MongoDB", err));

// Use routes for user actions
app.use('/api/users', userRoutes);  // All user-related routes will be prefixed with /api/users
app.use('/api/expenses', expensesRoutes);  // All expense-related routes will be prefixed with /api/expenses


// Start server
app.listen(3000, () => console.log('Server running at http://localhost:3000'));
