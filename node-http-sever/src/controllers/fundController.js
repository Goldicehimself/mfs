// Fund Request Controller
const fundService = require('../services/fundService');
const notificationService = require('../services/notificationService');
const response = require('../utils/response');
const { AuthorizationError } = require('../utils/errorHandler');
const { sendEmail } = require('../utils/email');

const createFundRequest = async (req, res, next) => {
  try {
    if (req.user.role !== 'finance') {
      throw new AuthorizationError('Only finance can request funds');
    }
    const fund = await fundService.createFundRequest(req.user.organization, req.user.id, req.validatedData || req.body);
    response.created(res, 'Fund request submitted', fund);
  } catch (error) {
    next(error);
  }
};

const listFunds = async (req, res, next) => {
  try {
    const funds = await fundService.listFunds(req.user.organization, req.validatedQuery || req.query);
    response.success(res, 'Fund requests retrieved', funds);
  } catch (error) {
    next(error);
  }
};

const listMyFunds = async (req, res, next) => {
  try {
    const funds = await fundService.listMyFunds(req.user.organization, req.user.id, req.validatedQuery || req.query);
    response.success(res, 'Your fund requests retrieved', funds);
  } catch (error) {
    next(error);
  }
};

const approveFund = async (req, res, next) => {
  try {
    const fund = await fundService.approveFund(req.user.organization, req.params.id, req.user.id);
    await notificationService.createNotification({
      user: fund.requestedBy,
      organization: req.user.organization,
      title: 'Fund request approved',
      message: 'Your fund request was approved.',
      type: 'fund_approved',
      entityType: 'FundRequest',
      entityId: fund._id,
      link: '/finance-portal'
    });
    if (fund.requestedBy?.email) {
      await sendEmail({
        to: fund.requestedBy.email,
        subject: 'Fund request approved',
        text: `Your fund request for ${fund.purpose} (${fund.amount}) was approved.`
      });
    }
    response.success(res, 'Fund request approved', fund);
  } catch (error) {
    next(error);
  }
};

const rejectFund = async (req, res, next) => {
  try {
    const fund = await fundService.rejectFund(req.user.organization, req.params.id, req.user.id);
    await notificationService.createNotification({
      user: fund.requestedBy,
      organization: req.user.organization,
      title: 'Fund request rejected',
      message: 'Your fund request was rejected.',
      type: 'fund_rejected',
      entityType: 'FundRequest',
      entityId: fund._id,
      link: '/finance-portal'
    });
    response.success(res, 'Fund request rejected', fund);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createFundRequest,
  listFunds,
  listMyFunds,
  approveFund,
  rejectFund
};
