import validator from 'validator';

// Validation middleware for signup
export const validateSignup = (req, res, next) => {
  const { username, password, email, fullName, securityQuestion, securityAnswer } = req.body;
  const errors = [];

  // Check for required fields
  if (!username || !username.trim()) {
    errors.push('Username is required');
  } else if (username.trim().length < 3) {
    errors.push('Username must be at least 3 characters long');
  } else if (username.trim().length > 30) {
    errors.push('Username cannot exceed 30 characters');
  } else if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
    errors.push('Username can only contain letters, numbers, and underscores');
  }

  if (!password) {
    errors.push('Password is required');
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  } else if (password.length > 128) {
    errors.push('Password cannot exceed 128 characters');
  }

  if (!email || !email.trim()) {
    errors.push('Email is required');
  } else if (!validator.isEmail(email.trim())) {
    errors.push('Please provide a valid email address');
  }

  if (!fullName || !fullName.trim()) {
    errors.push('Full name is required');
  } else if (fullName.trim().length < 2) {
    errors.push('Full name must be at least 2 characters long');
  } else if (fullName.trim().length > 100) {
    errors.push('Full name cannot exceed 100 characters');
  }

  if (!securityQuestion || !securityQuestion.trim()) {
    errors.push('Security question is required');
  } else if (securityQuestion.trim().length < 10) {
    errors.push('Security question must be at least 10 characters long');
  } else if (securityQuestion.trim().length > 200) {
    errors.push('Security question cannot exceed 200 characters');
  }

  if (!securityAnswer || !securityAnswer.trim()) {
    errors.push('Security answer is required');
  } else if (securityAnswer.trim().length < 2) {
    errors.push('Security answer must be at least 2 characters long');
  } else if (securityAnswer.trim().length > 100) {
    errors.push('Security answer cannot exceed 100 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

// Validation middleware for login
export const validateLogin = (req, res, next) => {
  const { username, password } = req.body;
  const errors = [];

  if (!username || !username.trim()) {
    errors.push('Username or email is required');
  }

  if (!password) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};