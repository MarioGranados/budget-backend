const User = require("../models/User");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const createUser = async (username, email, password) => {
  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    username,
    email,
    password: hashedPassword,  // Save the hashed password
  });

  try {
    const savedUser = await user.save();
    console.log("User created:", savedUser);
    return savedUser;  // Return the saved user for use in response
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

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';  // Set this in your .env file

// Login user
async function loginUser(email, password) {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('User not found');
    }

    // Compare the provided password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    // Create a JWT token
    const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, {
      expiresIn: '72h', // Token will expire in 1 hour
    });

    return { token, user };
  } catch (err) {
    throw new Error('Login failed: ' + err.message);
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

module.exports = { findUserByEmail, createUser, loginUser, changeUserPassword };


module.exports = { findUserByEmail, createUser, loginUser, changeUserPassword };
