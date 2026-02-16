// Auth Controller
const authService = require('../services/authService');
const response = require('../utils/response');

const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;
    const result = await authService.register(firstName, lastName, email, password, role);
    response.created(res, 'User registered successfully', result);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    response.success(res, 'Login successful', result);
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    response.success(res, 'Logged out successfully', null);
  } catch (error) {
    next(error);
  }
};

const verifyToken = async (req, res, next) => {
  try {
    const result = authService.validateToken(req.headers.authorization?.split(' ')[1]);
    response.success(res, 'Token is valid', { user: result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  verifyToken
};
