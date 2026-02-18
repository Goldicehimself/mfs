// Authentication middleware using JWT
const jwt = require('jsonwebtoken');
const { AuthenticationError } = require('../utils/errorHandler');
const constants = require('../constants/constants');
const Organization = require('../models/Organization');

const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.query?.token;
    
    if (!token) {
      throw new AuthenticationError('No token provided');
    }

    const decoded = jwt.verify(token, constants.JWT_SECRET);
    if (decoded?.organization) {
      const org = await Organization.findById(decoded.organization).select('status');
      if (!org || org.status !== 'active') {
        throw new AuthenticationError('Organization is disabled');
      }
    }
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
