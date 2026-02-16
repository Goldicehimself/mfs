// Authentication Service
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const constants = require('../config/constants');
const { ValidationError, AuthenticationError, ConflictError } = require('../utils/errorHandler');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    constants.JWT_SECRET,
    { expiresIn: constants.JWT_EXPIRE }
  );
};

const register = async (firstName, lastName, email, password, role = constants.ROLES.USER) => {
  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ConflictError('Email already registered');
  }

  // Create new user
  const user = new User({
    firstName,
    lastName,
    email,
    password,
    role
  });

  await user.save();

  const token = generateToken(user);
  const userResponse = user.toObject();
  delete userResponse.password;

  return { user: userResponse, token };
};

const login = async (email, password) => {
  if (!email || !password) {
    throw new ValidationError('Email and password are required');
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AuthenticationError('Invalid email or password');
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  const token = generateToken(user);
  const userResponse = user.toObject();
  delete userResponse.password;

  return { user: userResponse, token };
};

const validateToken = (token) => {
  try {
    const decoded = jwt.verify(token, constants.JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new AuthenticationError('Invalid token');
  }
};

module.exports = {
  register,
  login,
  validateToken,
  generateToken
};
