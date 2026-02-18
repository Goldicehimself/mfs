// Auth Controller
const authService = require('../services/authService');
const response = require('../utils/response');
const { NotFoundError, ValidationError } = require('../utils/errorHandler');
const User = require('../models/User');
const path = require('path');

const register = async (req, res, next) => {
  try {
    const payload = req.validatedData || req.body;
    const result = await authService.register(payload);
    response.created(res, 'User registered successfully', result);
  } catch (error) {
    next(error);
  }
};

const registerOrganization = async (req, res, next) => {
  try {
    const payload = req.validatedData || req.body;
    const result = await authService.registerOrganization(payload);
    response.created(res, 'Organization registered successfully', result);
  } catch (error) {
    next(error);
  }
};

const createInvite = async (req, res, next) => {
  try {
    const payload = req.validatedData || req.body;
    const result = await authService.createInviteCode({
      organizationId: req.user.organization,
      role: payload.role,
      expiresAt: payload.expiresAt,
      createdBy: req.user.id
    });
    response.created(res, 'Invite code created', result);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password, orgCode } = req.validatedData || req.body;
    const result = await authService.login(email, password, orgCode);
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

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) throw new NotFoundError('User');
    response.success(res, 'Profile retrieved', user);
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const payload = req.validatedData || req.body;
    const updates = {
      firstName: payload.firstName,
      lastName: payload.lastName,
      phone: payload.phone,
      department: payload.department,
      avatar: payload.avatar
    };

    if (req.file?.path) {
      updates.avatar = req.file.path;
    }

    Object.keys(updates).forEach((key) => {
      if (updates[key] === undefined) delete updates[key];
    });

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true
    }).select('-password');

    if (!user) throw new NotFoundError('User');
    response.success(res, 'Profile updated', user);
  } catch (error) {
    next(error);
  }
};

const uploadCertificates = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      throw new ValidationError('At least one certificate is required');
    }

    const filePaths = req.files.map((file) => file.path.split(path.sep).join('/'));
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $addToSet: { certificates: { $each: filePaths } } },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) throw new NotFoundError('User');
    response.success(res, 'Certificates uploaded successfully', user);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  registerOrganization,
  login,
  logout,
  verifyToken,
  getProfile,
  updateProfile,
  uploadCertificates,
  createInvite
};
