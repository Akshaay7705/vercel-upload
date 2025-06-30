import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validateSignup, validateLogin } from '../middleware/validation.js';
import { xorDecrypt } from '../utils/xorDecryptor.js';

const router = express.Router();

// @desc    Register a new user
// @route   POST /api/signup
// @access  Public
router.post('/signup', validateSignup, asyncHandler(async (req, res) => { 
  const {
  username,
  password,
  email,
  fullName,
  securityQuestion,
  securityAnswer,
} = req.body;

  // Additional server-side validation
  if (!validator.isEmail(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address'
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long'
    });
  }

  try {
    // Check if user already exists (case-insensitive)
    const existingUser = await User.findOne({
      $or: [
        { username: { $regex: new RegExp(`^${username}$`, 'i') } },
        { email: { $regex: new RegExp(`^${email}$`, 'i') } }
      ]
    });

    if (existingUser) {
      const field = existingUser.username.toLowerCase() === username.toLowerCase() ? 'Username' : 'Email';
      return res.status(409).json({
        success: false,
        message: `${field} is already registered`
      });
    }

    // Hash password and security answer
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const hashedSecurityAnswer = await bcrypt.hash(securityAnswer.toLowerCase().trim(), saltRounds);

    // Create new user
    
    const newUser = new User({
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      fullName: fullName.trim(),
      securityQuestion: securityQuestion.trim(),
      securityAnswer: hashedSecurityAnswer
    });

    const savedUser = await newUser.save();
    
    //create token 
    const token = jwt.sign({ _id: newUser._id }, process.env.JWT_SECRET);
    // Return success response (don't include sensitive data)
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        token : `Bearer ${token}`,
        username: savedUser.username,
        email: savedUser.email,
        fullName: savedUser.fullName,
        createdAt: savedUser.createdAt
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        success: false,
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} is already registered`
      });
    }

    // Generic error response
    res.status(500).json({
      success: false,
      message: 'Internal server error during signup',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}));

// @desc    Authenticate user and login
// @route   POST /api/login
// @access  Public
router.post('/login', validateLogin, asyncHandler(async (req, res) => {
  // const { encryptedData, sessionKey } = req.body;

  // Decrypt username and password
  const { username, password } = req.body;

  try {
    // Find user by username or email (case-insensitive)
    const user = await User.findOne({
      $or: [
        { username: { $regex: new RegExp(`^${username}$`, 'i') } },
        { email: { $regex: new RegExp(`^${username}$`, 'i') } }
      ]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      const lockTimeRemaining = Math.ceil((user.lockUntil - Date.now()) / (1000 * 60)); // minutes
      return res.status(423).json({
        success: false,
        message: `Account is temporarily locked. Try again in ${lockTimeRemaining} minutes.`
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account has been deactivated. Please contact support.'
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // Increment login attempts
      await user.incLoginAttempts();
      
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    // Return success response (don't include sensitive data)
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token : `Bearer ${token}`,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}));

// @desc    Get user profile
// @route   GET /api/profile/:id
// @access  Public (should be protected in production)
router.get('/profile/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid user ID format'
    });
  }

  try {
    const user = await User.findById(id).select('-password -securityAnswer');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}));

export default router;