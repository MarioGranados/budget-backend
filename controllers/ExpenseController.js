const Expense = require("../models/Expense");
const User = require("../models/User");
const mongoose = require('mongoose');

// Add a single expense to a user
const addExpenseToUser = async (userId, expenseData) => {
  const expense = new Expense(expenseData);
  await expense.save(); // Save the expense

  // Attach expense to user
  await User.findByIdAndUpdate(userId, {
    $push: { expenses: expense._id }, // Add the expense _id to the user's expenses array
  });
  return expense;
};

// Delete an expense by ID
const deleteExpenseById = async (expenseId, userId) => {
  const expense = await Expense.findByIdAndDelete(expenseId);
  if (!expense) throw new Error("Expense not found");

  // Remove the expense reference from the user's expenses array
  await User.findByIdAndUpdate(userId, {
    $pull: { expenses: expenseId }, // Remove the expense from the user's expenses array
  });

  return { message: "Expense deleted" };
};

// Get all expenses for a user
const getAllExpensesFromUser = async (userId) => {
  // Check if userId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    console.log('Invalid userId format:', userId); // Debugging: Log invalid userId
    throw new Error('Invalid userId format');
  }

  try {
    // Populate the expenses array with expense details
    const user = await User.findById(userId).populate('expenses');
    if (!user) throw new Error('User not found');
    
    return user.expenses;
  } catch (err) {
    // Handle any other errors (e.g., database issues)
    console.log('Error retrieving expenses:', err);  // Debugging: Log the error
    throw new Error('Error retrieving expenses: ' + err.message);
  }
};

// Add multiple expenses
const addNewExpenses = async (userId, expensesData) => {

  console.log(userId)
  // Insert multiple expenses into the database
  const expenses = await Expense.insertMany(expensesData);

  // Collect the expense IDs from the inserted expenses
  const expenseIds = expenses.map((expense) => expense._id);

  // Attach multiple expense IDs to the user
  await User.findByIdAndUpdate(userId, {
    $push: { expenses: { $each: expenseIds } }, // Attach multiple expenses to user
  });



  return expenses;
};

module.exports = { addNewExpenses, getAllExpensesFromUser, deleteExpenseById, addExpenseToUser };
