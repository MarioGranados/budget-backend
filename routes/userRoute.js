const express = require("express");
const { authenticateToken } = require("../middleware/authMiddleWare");

const {
  createUser,
  findUserByEmail,
  loginUser, updateUserIncome, changeUserPassword, getUserIncome
} = require("../controllers/UserController");
const router = express.Router();

// Register a new user
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const newUser = await createUser(username, email, password);
    res.status(201).json({ message: "User created", user: newUser });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating user", error: err.message });
  }
});

// Login a user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const { token, user } = await loginUser(email, password);
    res.status(200).json({
      message: "Login successful",
      token,
      user,
    });
  } catch (err) {
    res.status(400).json({ message: "Login failed", error: err.message });
  }
});

// Find a user by email
router.get("/user/:email", async (req, res) => {
  try {
    const user = await findUserByEmail(req.params.email);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Error finding user", error: err.message });
  }
});

// Delete a user
router.delete("/delete-user/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting user", error: err.message });
  }
});

router.put("/change-password", async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;
  try {
    const result = await changeUserPassword(email, oldPassword, newPassword);
    res.status(200).json(result);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Password change failed", error: err.message });
  }
});

// Update user income
router.put("/update-income", authenticateToken, async (req, res) => {
  const { income } = req.body; // Assume income is passed in the request body
  const userId = req.user.userId; // Get the userId from the token

  try {
    const updatedUser = await updateUserIncome(userId, income);
    res.status(200).json({ message: "User income updated", user: updatedUser });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Income update failed", error: err.message });
  }
});

// Get user income (new route)
router.get("/get-income", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId; // Get the userId from the token
    const income = await getUserIncome(userId); // Fetch income using the userId
    if (income === null) {
      return res.status(404).json({ message: "Income not found" });
    }
    res.status(200).json({ income });
  } catch (err) {
    res.status(500).json({ message: "Error fetching income", error: err.message });
  }
});

module.exports = router;
