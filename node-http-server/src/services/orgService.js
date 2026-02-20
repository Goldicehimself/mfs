// Organization Service
const Organization = require('../models/Organization');
const User = require('../models/User');
const crypto = require('crypto');
const constants = require('../constants/constants');
const { NotFoundError, ValidationError } = require('../utils/errorHandler');

const DEFAULT_SETTINGS = {
  securityPolicy: {
    twoFactorAuth: false,
    enforceMfa: false,
    sessionTimeoutMinutes: 120,
    strongPassword: true,
    minPasswordLength: 12,
    lockoutThreshold: 5,
    restrictInviteDomains: false,
    allowedInviteDomains: []
  },
  notifications: {
    notifyWoCreated: true,
    notifyWoAssigned: true,
    notifyWoOverdue: true,
    notifyPmDue: true,
    notifyEmail: true,
    notifyInApp: true,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '06:00'
  },
  companyProfile: {
    companyName: '',
    logoUrl: '',
    logoDataUrl: '',
    address: '',
    contactEmail: '',
    contactPhone: '',
    industry: '',
    supportEmail: '',
    supportPhone: ''
  },
  integrations: {
    webhooks: [],
    apiKeys: []
  }
};

const normalizeAllowedDomains = (domains = []) => {
  const list = Array.isArray(domains) ? domains : [];
  return Array.from(
    new Set(
      list
        .map((d) => String(d || '').trim().toLowerCase())
        .filter(Boolean)
    )
  );
};

const normalizeSettings = (organization) => {
  const current = organization?.settings || {};
  const securityPolicy = {
    ...DEFAULT_SETTINGS.securityPolicy,
    ...(current.securityPolicy || {})
  };
  securityPolicy.allowedInviteDomains = normalizeAllowedDomains(securityPolicy.allowedInviteDomains);

  const notifications = {
    ...DEFAULT_SETTINGS.notifications,
    ...(current.notifications || {})
  };

  const companyProfile = {
    ...DEFAULT_SETTINGS.companyProfile,
    ...(current.companyProfile || {})
  };

  const integrations = {
    ...DEFAULT_SETTINGS.integrations,
    ...(current.integrations || {})
  };

  if (!companyProfile.companyName && organization?.name) {
    companyProfile.companyName = organization.name;
  }
  if (!companyProfile.industry && organization?.industry) {
    companyProfile.industry = organization.industry;
  }

  return { securityPolicy, notifications, companyProfile, integrations };
};

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

const getSettings = async (organizationId) => {
  const org = await Organization.findById(organizationId).select('settings name industry');
  if (!org) throw new NotFoundError('Organization');
  return { settings: normalizeSettings(org) };
};

const updateSettings = async (organizationId, payload = {}) => {
  const org = await Organization.findById(organizationId);
  if (!org) throw new NotFoundError('Organization');

  if (!org.settings) {
    org.settings = {};
  }

  if (payload.securityPolicy) {
    const updatedPolicy = {
      ...DEFAULT_SETTINGS.securityPolicy,
      ...(org.settings.securityPolicy || {}),
      ...(payload.securityPolicy || {})
    };
    updatedPolicy.allowedInviteDomains = normalizeAllowedDomains(updatedPolicy.allowedInviteDomains);
    org.settings.securityPolicy = updatedPolicy;
  }

  if (payload.notifications) {
    org.settings.notifications = {
      ...DEFAULT_SETTINGS.notifications,
      ...(org.settings.notifications || {}),
      ...(payload.notifications || {})
    };
  }

  if (payload.companyProfile) {
    const updatedProfile = {
      ...DEFAULT_SETTINGS.companyProfile,
      ...(org.settings.companyProfile || {}),
      ...(payload.companyProfile || {})
    };
    org.settings.companyProfile = updatedProfile;

    if (updatedProfile.companyName) {
      org.name = updatedProfile.companyName;
    }
    if (updatedProfile.industry) {
      org.industry = updatedProfile.industry;
    }
  }

  await org.save();
  return { settings: normalizeSettings(org) };
};

const getPublicSecurityPolicy = async ({ orgCode, inviteCode } = {}) => {
  const normalizedOrgCode = orgCode ? String(orgCode).toUpperCase() : null;
  const normalizedInviteCode = inviteCode ? String(inviteCode).toUpperCase() : null;

  let org;
  if (normalizedInviteCode) {
    org = await Organization.findOne({ 'invites.code': normalizedInviteCode }).select('settings status');
  }
  if (!org && normalizedOrgCode) {
    org = await Organization.findOne({ orgCode: normalizedOrgCode }).select('settings status');
  }
  if (!org) throw new NotFoundError('Organization');
  if (org.status !== 'active') throw new ValidationError('Organization is disabled');

  const settings = normalizeSettings(org);
  return { securityPolicy: settings.securityPolicy };
};

const verifyOrgEmail = async (token) => {
  const tokenHash = crypto.createHash('sha256').update(String(token || '')).digest('hex');
  const org = await Organization.findOne({
    orgEmailVerificationTokenHash: tokenHash,
    orgEmailVerificationExpiresAt: { $gt: new Date() }
  });
  if (!org) throw new ValidationError('Verification token is invalid or expired');

  org.orgEmailVerifiedAt = new Date();
  org.orgEmailVerificationTokenHash = null;
  org.orgEmailVerificationExpiresAt = null;
  await org.save();

  return { orgId: org._id, verifiedAt: org.orgEmailVerifiedAt };
};

const resendOrgEmailVerification = async ({ orgCode, email } = {}) => {
  const normalizedOrgCode = String(orgCode || '').toUpperCase();
  const normalizedEmail = String(email || '').toLowerCase();
  const org = await Organization.findOne({
    orgCode: normalizedOrgCode,
    orgEmail: normalizedEmail
  });
  if (!org) throw new ValidationError('Organization email or code is invalid');

  const rawToken = crypto.randomBytes(24).toString('hex');
  const newHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  org.orgEmailVerificationTokenHash = newHash;
  org.orgEmailVerificationExpiresAt = expiresAt;
  await org.save();

  const { sendEmail } = require('../utils/email');
  const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const verifyLink = `${frontendBaseUrl}/verify-org-email?token=${rawToken}`;
  await sendEmail({
    to: org.orgEmail,
    subject: 'Verify your organization email',
    text: `Please verify your organization email by visiting: ${verifyLink}`,
    html: `<p>Please verify your organization email by clicking the link below:</p><p><a href="${verifyLink}">${verifyLink}</a></p>`
  });

  return { sent: true };
};

const getIntegrations = async (organizationId) => {
  const org = await Organization.findById(organizationId).select('settings');
  if (!org) throw new NotFoundError('Organization');
  const settings = normalizeSettings(org);

  return {
    webhooks: (settings.integrations.webhooks || []).map((hook) => ({
      id: hook.id,
      name: hook.name,
      url: hook.url,
      events: hook.events || [],
      active: !!hook.active,
      createdAt: hook.createdAt,
      deliveryLogs: (hook.deliveryLogs || []).slice(-20)
    })),
    apiKeys: (settings.integrations.apiKeys || []).map((key) => ({
      id: key.id,
      name: key.name,
      prefix: key.prefix,
      last4: key.last4,
      scopes: key.scopes || [],
      expiresAt: key.expiresAt,
      lastUsedAt: key.lastUsedAt,
      rateLimit: key.rateLimit || constants.DEFAULT_API_KEY_RATE_LIMIT,
      createdAt: key.createdAt,
      revokedAt: key.revokedAt
    }))
  };
};

const createWebhook = async (organizationId, { name, url, events = [], active = true } = {}) => {
  const org = await Organization.findById(organizationId);
  if (!org) throw new NotFoundError('Organization');

  const id = crypto.randomBytes(12).toString('hex');
  const secret = crypto.randomBytes(24).toString('hex');

  if (!org.settings) org.settings = {};
  if (!org.settings.integrations) org.settings.integrations = {};
  if (!Array.isArray(org.settings.integrations.webhooks)) org.settings.integrations.webhooks = [];

  org.settings.integrations.webhooks.push({
    id,
    name,
    url,
    secret,
    events,
    active: !!active
  });

  await org.save();

  return {
    webhook: { id, name, url, events, active: !!active, createdAt: new Date(), deliveryLogs: [] },
    secret
  };
};

const deleteWebhook = async (organizationId, webhookId) => {
  const org = await Organization.findById(organizationId);
  if (!org) throw new NotFoundError('Organization');

  const webhooks = org.settings?.integrations?.webhooks || [];
  const nextWebhooks = webhooks.filter((hook) => hook.id !== webhookId);
  if (nextWebhooks.length === webhooks.length) {
    throw new NotFoundError('Webhook');
  }

  org.settings.integrations.webhooks = nextWebhooks;
  await org.save();

  return { id: webhookId };
};

const createApiKey = async (organizationId, { name, scopes = [], expiresAt = null, rateLimit = {} } = {}) => {
  const org = await Organization.findById(organizationId);
  if (!org) throw new NotFoundError('Organization');

  const raw = crypto.randomBytes(24).toString('hex');
  const key = `mp_${raw}`;
  const prefix = key.slice(0, 8);
  const last4 = key.slice(-4);
  const hash = crypto.createHash('sha256').update(key).digest('hex');
  const id = crypto.randomBytes(12).toString('hex');
  const resolvedRateLimit = {
    ...constants.DEFAULT_API_KEY_RATE_LIMIT,
    ...(rateLimit || {})
  };

  if (!org.settings) org.settings = {};
  if (!org.settings.integrations) org.settings.integrations = {};
  if (!Array.isArray(org.settings.integrations.apiKeys)) org.settings.integrations.apiKeys = [];

  org.settings.integrations.apiKeys.push({
    id,
    name,
    prefix,
    last4,
    hash,
    scopes,
    expiresAt: expiresAt ? new Date(expiresAt) : null,
    rateLimit: resolvedRateLimit
  });

  await org.save();

  return {
    apiKey: { id, name, prefix, last4, scopes, expiresAt: expiresAt ? new Date(expiresAt) : null, rateLimit: resolvedRateLimit, createdAt: new Date(), revokedAt: null, lastUsedAt: null },
    key
  };
};

const revokeApiKey = async (organizationId, apiKeyId) => {
  const org = await Organization.findById(organizationId);
  if (!org) throw new NotFoundError('Organization');

  const keys = org.settings?.integrations?.apiKeys || [];
  const match = keys.find((key) => key.id === apiKeyId);
  if (!match) throw new NotFoundError('API key');

  match.revokedAt = new Date();
  await org.save();

  return { id: apiKeyId, revokedAt: match.revokedAt };
};

const appendWebhookDeliveryLog = async (organizationId, webhookId, logEntry) => {
  const org = await Organization.findById(organizationId);
  if (!org) throw new NotFoundError('Organization');

  const webhooks = org.settings?.integrations?.webhooks || [];
  const webhook = webhooks.find((hook) => hook.id === webhookId);
  if (!webhook) throw new NotFoundError('Webhook');

  webhook.deliveryLogs = [...(webhook.deliveryLogs || []), logEntry].slice(-20);
  await org.save();
};

const touchApiKeyLastUsed = async (organizationId, apiKeyId) => {
  await Organization.updateOne(
    { _id: organizationId, 'settings.integrations.apiKeys.id': apiKeyId },
    { $set: { 'settings.integrations.apiKeys.$.lastUsedAt': new Date() } }
  );
};

module.exports = {
  listMembers,
  listInvites,
  revokeInvite,
  disableOrganization,
  enableOrganization,
  setUserActiveStatus,
  getSettings,
  updateSettings,
  getPublicSecurityPolicy,
  verifyOrgEmail,
  resendOrgEmailVerification,
  normalizeSettings,
  getIntegrations,
  createWebhook,
  deleteWebhook,
  createApiKey,
  revokeApiKey,
  appendWebhookDeliveryLog,
  touchApiKeyLastUsed
};
