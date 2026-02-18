// Organization Service
const Organization = require('../models/Organization');
const User = require('../models/User');
const { NotFoundError, ValidationError } = require('../utils/errorHandler');

const listMembers = async (organizationId, { page = 1, limit = 20, role, search } = {}) => {
  const skip = (page - 1) * limit;
  const filter = { organization: organizationId };
  if (role) filter.role = role;

  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');
    filter.$or = [
      { firstName: regex },
      { lastName: regex },
      { email: regex }
    ];
  }

  const [members, total] = await Promise.all([
    User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter)
  ]);

  return {
    members,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

const listInvites = async (organizationId, { role, createdBy } = {}) => {
  const org = await Organization.findById(organizationId).select('invites');
  if (!org) throw new NotFoundError('Organization');
  let invites = (org.invites || []).filter((invite) => !invite.usedAt);
  if (role) {
    invites = invites.filter((invite) => invite.role === role);
  }
  if (createdBy) {
    invites = invites.filter((invite) => invite.createdBy?.toString?.() === createdBy);
  }
  return { invites };
};

const revokeInvite = async (organizationId, code) => {
  const normalizedCode = String(code || '').toUpperCase();
  const org = await Organization.findById(organizationId);
  if (!org) throw new NotFoundError('Organization');

  const inviteIndex = org.invites.findIndex((invite) => invite.code === normalizedCode);
  if (inviteIndex === -1) throw new NotFoundError('Invite');

  if (org.invites[inviteIndex].usedAt) {
    throw new ValidationError('Invite already used');
  }

  org.invites.splice(inviteIndex, 1);
  await org.save();
  return { code: normalizedCode };
};

const disableOrganization = async (organizationId) => {
  const org = await Organization.findByIdAndUpdate(
    organizationId,
    { status: 'disabled' },
    { new: true }
  );

  if (!org) throw new NotFoundError('Organization');

  await User.updateMany({ organization: organizationId }, { active: false });
  return org;
};

const enableOrganization = async (organizationId) => {
  const org = await Organization.findByIdAndUpdate(
    organizationId,
    { status: 'active' },
    { new: true }
  );

  if (!org) throw new NotFoundError('Organization');
  await User.updateMany({ organization: organizationId }, { active: true });
  return org;
};

const setUserActiveStatus = async (organizationId, userId, active) => {
  const user = await User.findOneAndUpdate(
    { _id: userId, organization: organizationId },
    { active: !!active },
    { new: true }
  ).select('-password');

  if (!user) throw new NotFoundError('User');
  return user;
};

module.exports = {
  listMembers,
  listInvites,
  revokeInvite,
  disableOrganization,
  enableOrganization,
  setUserActiveStatus
};
