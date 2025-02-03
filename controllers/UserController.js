const User = require("../models/User");
const bcrypt = require("bcryptjs"); // Change from 'bcrypt'
const jwt = require("jsonwebtoken");
const generateVerificationCode  = require('../utils/generateVerificationCode');

const { sendVerificationEmail } = require("../services/mailer");


// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key"; // Set this in your .env file

const createUser = async (username, email, password) => {
  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);
  const vCode = generateVerificationCode() // Generate a verification code

  const user = new User({
    username,
    email,
    password: hashedPassword,
    verificationCode: vCode,
  });

  try {
    const savedUser = await user.save();
    console.log("User created:", savedUser);

    // Send verification email immediately after user creation
    await sendVerificationEmail(savedUser.email, vCode);

    return savedUser;
  } catch (err) {
    console.error("Error creating user:", err);
    throw new Error("Error creating user");
  }
};

// Function to find a user by email
const findUserByEmail = async (email) => {
  try {
    const user = await User.findOne({ email });
    return user;
  } catch (err) {
    console.error("Error finding user:", err);
    throw err;
  }
};

// Login user
async function loginUser(email, password) {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("User not found");
    }

    // Compare the provided password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    // Create a JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      {
        expiresIn: "72h", // Token will expire in 1 hour
      }
    );

    // Convert to plain object and remove sensitive fields
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.__v;

    return { token, user: userObject };
  } catch (err) {
    throw new Error("Login failed: " + err.message);
  }
}

const changeUserPassword = async (email, oldPassword, newPassword) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("User not found");
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new Error("Incorrect current password");
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return { message: "Password updated successfully" };
  } catch (err) {
    throw new Error("Password change failed: " + err.message);
  }
};

const updateUserIncome = async (userId, income) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    user.income = income; // Assume 'income' field exists in the User model
    await user.save();

    return user; // Return the updated user object
  } catch (err) {
    throw new Error("Income update failed: " + err.message);
  }
};

// Controller function to get the user's income
async function getUserIncome(userId) {
  try {
    const user = await User.findById(userId); // Find user by ID
    if (!user) {
      throw new Error("User not found");
    }
    return user.income; // Assuming the user document has an "income" field
  } catch (err) {
    throw new Error(`Error fetching income: ${err.message}`);
  }
}

const resendVerificationEmail = async (userId) => {
  try {
    // Find the user by their ID
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Generate a new verification code
    const newVerificationCode = generateVerificationCode()

    // Update the user's verification code in the database
    user.verificationCode = newVerificationCode;
    await user.save();

    // Send the new verification email with the new code
    await sendVerificationEmail(user.email, newVerificationCode);

    return { message: "Verification email sent successfully" };
  } catch (err) {
    console.error("Error resending verification email:", err);
    throw new Error("Failed to resend verification email: " + err.message);
  }
};

module.exports = {
  findUserByEmail,
  createUser,
  loginUser,
  changeUserPassword,
  updateUserIncome,
  getUserIncome,
  resendVerificationEmail,
};
