const express = require("express");
const { authenticateToken } = require("../middleware/authMiddleWare");
const { sendVerificationEmail } = require("../services/mailer");
const generateVerificationCode = require("../utils/generateVerificationCode");
const User = require("../models/User");

const {
  createUser,
  getUserData,
  loginUser,
  updateUserIncome,
  changeUserPassword,
  getUserIncome,
} = require("../controllers/UserController");
const { findById } = require("../models/Expense");
const router = express.Router();

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const newUser = await createUser(username, email, password);

    // Generate a verification code and send the verification email
    const verificationCode = generateVerificationCode();
    newUser.verificationCode = verificationCode;
    await newUser.save();

    // Convert to plain object if it's a Mongoose document
    const userObject = newUser.toObject ? newUser.toObject() : newUser;

    // Remove sensitive fields
    userObject.password = undefined;
    userObject.__v = undefined;

    await sendVerificationEmail(newUser.email, verificationCode); // Send verification email

    res.status(200).json({
      message: "User created. Please verify your email.",
      user: userObject,
    });
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

// Find a user data
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await getUserData(req.user.userId); // Await the result of getUserData
    // Convert to plain object to remove fields safely
    const userObject = user.toObject ? user.toObject() : user;

    // Remove sensitive fields
    userObject.password = undefined;
    userObject.__v = undefined;

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user: userObject });
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
    res
      .status(500)
      .json({ message: "Error fetching income", error: err.message });
  }
});

// Verify email
router.post("/verify-email", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const verificationCode = req.body.verificationCode;

    // Retrieve the full user object
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the verification code matches
    if (user.verificationCode !== verificationCode) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    // Update the user's verified status
    user.isVerified = true;
    user.verificationCode = null; // Clear the verification code
    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error verifying email", error: err.message });
  }
});

// Resend verification code
router.post(
  "/resend-verification-code",
  authenticateToken,
  async (req, res) => {
    try {
      const userId = req.user.userId;

      // Retrieve the full user object
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Generate a new 4-digit verification code
      const newVerificationCode = generateVerificationCode();

      // Update the user's verification code
      user.verificationCode = newVerificationCode;
      await user.save(); // Save the updated user object

      // Send the new verification code via email
      await sendVerificationEmail(user.email, newVerificationCode);

      res
        .status(200)
        .json({ message: "Verification code resent successfully" });
    } catch (err) {
      res.status(500).json({
        message: "Error resending verification code",
        error: err.message,
      });
    }
  }
);

module.exports = router;
