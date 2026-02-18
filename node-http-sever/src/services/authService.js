// Authentication Service
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Organization = require('../models/Organization');
const constants = require('../constants/constants');
const { ValidationError, AuthenticationError, ConflictError } = require('../utils/errorHandler');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role, organization: user.organization },
    constants.JWT_SECRET,
    { expiresIn: constants.JWT_EXPIRE }
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
    orgCode
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

const login = async (email, password, orgCode) => {
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
  registerOrganization,
  createInviteCode,
  login,
  validateToken,
  generateToken
};
