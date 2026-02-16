// Authentication middleware using JWT
const jwt = require('jsonwebtoken');
const { AuthenticationError } = require('../utils/errorHandler');
const constants = require('../config/constants');

const protect = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      throw new AuthenticationError('No token provided');
    }

    const decoded = jwt.verify(token, constants.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    next(new AuthenticationError('Invalid or expired token'));
  }
};

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthenticationError('User not authenticated'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      const { AuthorizationError } = require('../utils/errorHandler');
      return next(new AuthorizationError('Insufficient permissions'));
    }

    next();
  };
};

module.exports = {
  protect,
  authorize
};
