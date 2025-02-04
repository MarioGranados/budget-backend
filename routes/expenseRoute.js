const express = require("express");
const { authenticateToken } = require("../middleware/authMiddleWare");
const {
  addExpenseToUser,
  deleteExpenseById,
  getAllExpensesFromUser,
  addNewExpenses,
} = require("../controllers/ExpenseController");
const router = express.Router();
const mongoose = require("mongoose");

// Add a single expense to a user
router.post("/add-expense", authenticateToken, async (req, res) => {
  const { name, cost, description } = req.body;
  const userId = req.user.userId;

  const expenseData = { name, cost, description };

  try {
    const expense = await addExpenseToUser(userId, expenseData);
    res.status(201).json({ message: "Expense added", expense });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error adding expense", error: err.message });
  }
});

// Add multiple expenses
router.post("/add-expenses", authenticateToken, async (req, res) => {
  const expensesData = req.body.expenses;
  const userId = req.user.userId;

  try {
    const expenses = await addNewExpenses(userId, expensesData);
    res.status(201).json({ message: "Expenses added", expenses });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error adding expenses", error: err.message });
  }
});

router.get("/user-expenses", authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    const expenses = await getAllExpensesFromUser(userId);
    res.status(200).json({ expenses });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching expenses", error: err.message });
  }
});

// Delete an expense by ID
router.delete(
  "/delete-expense/:expenseId",
  authenticateToken,
  async (req, res) => {
    const { expenseId } = req.params;
    const userId = req.user.userId;

    try {
      const result = await deleteExpenseById(expenseId, userId);
      res.status(200).json(result);
    } catch (err) {
      res
        .status(500)
        .json({ message: "Error deleting expense", error: err.message });
    }
  }
);

module.exports = router;
