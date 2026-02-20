// Authentication Service
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Organization = require('../models/Organization');
const constants = require('../constants/constants');
const { ValidationError, AuthenticationError, ConflictError } = require('../utils/errorHandler');
const { normalizeSettings } = require('./orgService');
const { sendEmail } = require('../utils/email');

const isEmailAllowedByPolicy = (email, securityPolicy) => {
  if (!securityPolicy?.restrictInviteDomains) return true;
  const domain = String(email || '').split('@')[1]?.toLowerCase();
  if (!domain) return false;
  const allowed = Array.isArray(securityPolicy.allowedInviteDomains)
    ? securityPolicy.allowedInviteDomains
    : [];
  if (!allowed.length) return false;
  return allowed.includes(domain);
};

const generateToken = (user, expiresIn) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role, organization: user.organization },
    constants.JWT_SECRET,
    { expiresIn: expiresIn || constants.JWT_EXPIRE }
  );
};

const registerOrganization = async ({
  organizationName,
  industry,
  firstName,
  lastName,
  email,
  password
}) => {
  if (!organizationName) throw new ValidationError('Organization name is required');
  if (!firstName || !lastName || !email || !password) {
    throw new ValidationError('Admin user details are required');
  }

  let orgCode;
  for (let i = 0; i < 5; i += 1) {
    orgCode = Organization.generateOrgCode();
    const exists = await Organization.findOne({ orgCode });
    if (!exists) break;
  }
  if (!orgCode) throw new ValidationError('Failed to generate organization code');

  const organization = new Organization({
    name: organizationName,
    industry,
    orgCode,
    orgEmail: email
  });

  await organization.save();

  const user = new User({
    firstName,
    lastName,
    email,
    password,
    role: constants.ROLES.ADMIN,
    organization: organization._id
  });

  await user.save();

  const rawToken = crypto.randomBytes(24).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  organization.orgEmailVerificationTokenHash = tokenHash;
  organization.orgEmailVerificationExpiresAt = expiresAt;
  await organization.save();

  const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const verifyLink = `${frontendBaseUrl}/verify-org-email?token=${rawToken}`;
  await sendEmail({
    to: email,
    subject: 'Verify your organization email',
    text: `Please verify your organization email by visiting: ${verifyLink}`,
    html: `<p>Please verify your organization email by clicking the link below:</p><p><a href="${verifyLink}">${verifyLink}</a></p>`
  });

  const token = generateToken(user);
  const userResponse = user.toObject();
  delete userResponse.password;

  return { organization, user: userResponse, token };
};

const register = async ({
  firstName,
  lastName,
  email,
  password,
  role,
  orgCode,
  inviteCode
}) => {
  if (!orgCode && !inviteCode) {
    throw new ValidationError('orgCode or inviteCode is required');
  }

  const normalizedOrgCode = orgCode ? String(orgCode).toUpperCase() : null;
  const normalizedInviteCode = inviteCode ? String(inviteCode).toUpperCase() : null;

  let organization;
  let assignedRole = role || constants.ROLES.STAFF;
  let inviteIndex = -1;

  if (normalizedInviteCode) {
    organization = await Organization.findOne({ 'invites.code': normalizedInviteCode });
    if (!organization) {
      throw new ValidationError('Invalid invite code');
    }
    if (organization.status !== 'active') {
      throw new ValidationError('Organization is disabled');
    }

    inviteIndex = organization.invites.findIndex((inv) => inv.code === normalizedInviteCode);
    const invite = organization.invites[inviteIndex];
    if (!invite || invite.usedAt) {
      throw new ValidationError('Invite code already used');
    }
    if (invite.expiresAt && invite.expiresAt < new Date()) {
      throw new ValidationError('Invite code expired');
    }
    assignedRole = invite.role;
  }

  if (normalizedOrgCode) {
    if (!organization) {
      organization = await Organization.findOne({ orgCode: normalizedOrgCode });
    }
    if (!organization) {
      throw new ValidationError('Organization not found');
    }
    if (organization.status !== 'active') {
      throw new ValidationError('Organization is disabled');
    }
    if (!inviteCode && assignedRole === constants.ROLES.ADMIN) {
      throw new ValidationError('Admin role requires organization registration');
    }
  }

  const settings = normalizeSettings(organization);
  if (!isEmailAllowedByPolicy(email, settings.securityPolicy)) {
    throw new ValidationError('Email domain is not allowed for this organization');
  }

  // Check if user exists within org
  const existingUser = await User.findOne({ email, organization: organization._id });
  if (existingUser) {
    throw new ConflictError('Email already registered for this organization');
  }

  const user = new User({
    firstName,
    lastName,
    email,
    password,
    role: assignedRole,
    organization: organization._id
  });

  await user.save();

  if (normalizedInviteCode && inviteIndex >= 0) {
    organization.invites[inviteIndex].usedAt = new Date();
    organization.invites[inviteIndex].usedBy = user._id;
    await organization.save();
  }

  const token = generateToken(user);
  const userResponse = user.toObject();
  delete userResponse.password;

  return { user: userResponse, token };
};

const createInviteCode = async ({ organizationId, role, expiresAt, createdBy }) => {
  if (!organizationId) throw new ValidationError('Organization is required');
  if (!role) throw new ValidationError('Role is required');

  const organization = await Organization.findById(organizationId);
  if (!organization) {
    throw new ValidationError('Organization not found');
  }
  if (organization.status !== 'active') {
    throw new ValidationError('Organization is disabled');
  }

  const code = Organization.generateInviteCode();
  organization.invites.push({
    code,
    role,
    expiresAt: expiresAt || null,
    createdBy
  });

  await organization.save();
  return { code, role, expiresAt: expiresAt || null };
};

const login = async (email, password, orgCode, rememberMe = false) => {
  if (!email || !password || !orgCode) {
    throw new ValidationError('Email, password, and orgCode are required');
  }

  const normalizedOrgCode = String(orgCode).toUpperCase();
  const organization = await Organization.findOne({ orgCode: normalizedOrgCode });
  if (!organization) {
    throw new AuthenticationError('Invalid org code');
  }
  if (organization.status !== 'active') {
    throw new AuthenticationError('Organization is disabled');
  }

  const user = await User.findOne({ email, organization: organization._id }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AuthenticationError('Invalid email or password');
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  const expiresIn = rememberMe ? constants.JWT_EXPIRE_LONG : constants.JWT_EXPIRE_SHORT;
  const token = generateToken(user, expiresIn);
  const userResponse = user.toObject();
  delete userResponse.password;

  return { user: userResponse, token };
};

const requestPasswordReset = async (email, orgCode) => {
  if (!email || !orgCode) {
    throw new ValidationError('Email and orgCode are required');
  }

  const normalizedOrgCode = String(orgCode).toUpperCase();
  const organization = await Organization.findOne({ orgCode: normalizedOrgCode });
  if (!organization) return { sent: false };

  const user = await User.findOne({ email: String(email).toLowerCase(), organization: organization._id });
  if (!user) return { sent: false };

  const rawToken = crypto.randomBytes(24).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  user.resetPasswordTokenHash = tokenHash;
  user.resetPasswordExpiresAt = expiresAt;
  await user.save();

  const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetLink = `${frontendBaseUrl}/reset-password?token=${rawToken}&orgCode=${normalizedOrgCode}`;
  await sendEmail({
    to: user.email,
    subject: 'Reset your FacilityPro password',
    text: `Reset your password using this link: ${resetLink}`,
    html: `<p>Reset your password using the link below:</p><p><a href="${resetLink}">${resetLink}</a></p>`
  });

  return { sent: true };
};

const resetPassword = async (token, orgCode, newPassword) => {
  const normalizedOrgCode = String(orgCode || '').toUpperCase();
  const organization = await Organization.findOne({ orgCode: normalizedOrgCode });
  if (!organization) throw new ValidationError('Invalid or expired reset token');

  const tokenHash = crypto.createHash('sha256').update(String(token || '')).digest('hex');
  const user = await User.findOne({
    organization: organization._id,
    resetPasswordTokenHash: tokenHash,
    resetPasswordExpiresAt: { $gt: new Date() }
  }).select('+password');

  if (!user) throw new ValidationError('Invalid or expired reset token');

  user.password = newPassword;
  user.resetPasswordTokenHash = null;
  user.resetPasswordExpiresAt = null;
  await user.save();

  return { success: true };
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
  registerOrganization,
  createInviteCode,
  login,
  requestPasswordReset,
  resetPassword,
  validateToken,
  generateToken
};
