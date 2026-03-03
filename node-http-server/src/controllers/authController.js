// Auth Controller
const authService = require('../services/authService');
const response = require('../utils/response');
const { NotFoundError, ValidationError } = require('../utils/errorHandler');
const userStatsService = require('../services/userStatsService');
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
    const inviterUser = await User.findById(req.user.id).select('firstName lastName email');
    const inviterName = [inviterUser?.firstName, inviterUser?.lastName].filter(Boolean).join(' ').trim();
    const result = await authService.createInviteCode({
      organizationId: req.user.organization,
      role: payload.role,
      expiresAt: payload.expiresAt,
      createdBy: req.user.id,
      inviteEmail: payload.email,
      inviter: {
        name: inviterName || inviterUser?.email,
        email: inviterUser?.email
      }
    });
    response.created(res, 'Invite code created', result);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password, orgCode, rememberMe } = req.validatedData || req.body;
    const result = await authService.login(email, password, orgCode, rememberMe);
    response.success(res, 'Login successful', result);
    if (result?.user?.organization && result?.user?.id) {
      userStatsService.refreshUserStats({
        organizationId: result.user.organization,
        userId: result.user.id
      }).catch(() => {});
    }
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email, orgCode } = req.validatedData || req.body;
    await authService.requestPasswordReset(email, orgCode);
    response.success(res, 'If the account exists, a reset email has been sent', { sent: true });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, orgCode, password } = req.validatedData || req.body;
    await authService.resetPassword(token, orgCode, password);
    response.success(res, 'Password reset successfully', { success: true });
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

const verifyUserEmail = async (req, res, next) => {
  try {
    const { token, orgCode, email } = req.validatedQuery || req.query;
    const result = await authService.verifyUserEmail(token, { orgCode, email });
    response.success(res, 'User email verified', result);
  } catch (error) {
    next(error);
  }
};

const resendUserEmailVerification = async (req, res, next) => {
  try {
    const { orgCode, email } = req.validatedData || req.body;
    const result = await authService.resendUserEmailVerification({ orgCode, email });
    response.success(res, 'Verification email resent', result);
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
    userStatsService.refreshUserStats({
      organizationId: req.user.organization,
      userId: req.user.id
    }).catch(() => {});
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  registerOrganization,
  login,
  forgotPassword,
  resetPassword,
  logout,
  verifyToken,
  verifyUserEmail,
  resendUserEmailVerification,
  getProfile,
  updateProfile,
  uploadCertificates,
  createInvite
};
