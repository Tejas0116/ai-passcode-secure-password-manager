const User = require('../models/User');
const Account = require('../models/Account');
const Activity = require('../models/Activity');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'jwt_secret_fallback_key_123', {
    expiresIn: '30d'
  });
};

// Register User
const registerUser = async (req, res) => {
  const { name, phone_number, email_address, username, password } = req.body;

  if (!name || !phone_number || !email_address || !username || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      phone_number,
      email_address,
      username,
      password: hashedPassword
    });

    if (user) {
      await Activity.create({ user_id: user._id, activity: 'User Registered' });
      res.status(201).json({
        _id: user._id,
        name: user.name,
        username: user.username,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login User
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Please provide username and password' });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect password' });
    }

    await Activity.create({ user_id: user._id, activity: 'User Logged In' });

    res.json({
      _id: user._id,
      name: user.name,
      username: user.username,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get User Profile
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update User Profile
const updateMe = async (req, res) => {
  const { name, phone_number, email_address, username, password } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if username is being changed and is already taken
    if (username && username !== user.username) {
      const usernameTaken = await User.findOne({ username });
      if (usernameTaken) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
      user.username = username;
    }

    if (name) user.name = name;
    if (phone_number) user.phone_number = phone_number;
    if (email_address) user.email_address = email_address;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await user.save();

    await Activity.create({ user_id: user._id, activity: 'Profile Details Updated' });

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      username: updatedUser.username,
      phone_number: updatedUser.phone_number,
      email_address: updatedUser.email_address,
      token: generateToken(updatedUser._id) // send a new token in case username changed
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete User Profile and Accounts
const deleteMe = async (req, res) => {
  try {
    // Delete user accounts
    await Account.deleteMany({ user_id: req.user._id });
    
    // Delete user
    await User.findByIdAndDelete(req.user._id);

    res.json({ message: 'User and all associated accounts deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateMe,
  deleteMe
};
