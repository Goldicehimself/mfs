// Organization Controller
const orgService = require('../services/orgService');
const response = require('../utils/response');
const { ValidationError } = require('../utils/errorHandler');

const listMembers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const result = await orgService.listMembers(req.user.organization, {
      page: parseInt(page),
      limit: parseInt(limit),
      role,
      search
    });
    response.success(res, 'Organization members retrieved', result);
  } catch (error) {
    next(error);
  }
};

const listInvites = async (req, res, next) => {
  try {
    const { role, createdBy } = req.validatedQuery || req.query;
    const result = await orgService.listInvites(req.user.organization, {
      role,
      createdBy
    });
    response.success(res, 'Organization invites retrieved', result);
  } catch (error) {
    next(error);
  }
};

const revokeInvite = async (req, res, next) => {
  try {
    const result = await orgService.revokeInvite(req.user.organization, req.params.code);
    response.success(res, 'Invite revoked', result);
  } catch (error) {
    next(error);
  }
};

const disableOrganization = async (req, res, next) => {
  try {
    const result = await orgService.disableOrganization(req.user.organization);
    response.success(res, 'Organization disabled', result);
  } catch (error) {
    next(error);
  }
};

const enableOrganization = async (req, res, next) => {
  try {
    const result = await orgService.enableOrganization(req.user.organization);
    response.success(res, 'Organization enabled', result);
  } catch (error) {
    next(error);
  }
};

const setUserActiveStatus = async (req, res, next) => {
  try {
    if (req.params.id === req.user.id) {
      throw new ValidationError('You cannot change your own status');
    }
    const { active } = req.validatedData || req.body;
    const user = await orgService.setUserActiveStatus(req.user.organization, req.params.id, active);
    response.success(res, 'User status updated', user);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listMembers,
  listInvites,
  revokeInvite,
  disableOrganization,
  enableOrganization,
  setUserActiveStatus
};
