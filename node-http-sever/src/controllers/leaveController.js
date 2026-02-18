// Leave Controller
const leaveService = require('../services/leaveService');
const notificationService = require('../services/notificationService');
const response = require('../utils/response');
const { AuthorizationError } = require('../utils/errorHandler');

const createLeaveRequest = async (req, res, next) => {
  try {
    if (req.user.role !== 'staff') {
      throw new AuthorizationError('Only staff can request leave');
    }
    const leave = await leaveService.createLeaveRequest(req.user.organization, req.user.id, req.validatedData || req.body);
    response.created(res, 'Leave request submitted', leave);
  } catch (error) {
    next(error);
  }
};

const getMyLeaves = async (req, res, next) => {
  try {
    const leaves = await leaveService.getMyLeaves(req.user.organization, req.user.id);
    response.success(res, 'Leave requests retrieved', leaves);
  } catch (error) {
    next(error);
  }
};

const getPendingLeaves = async (req, res, next) => {
  try {
    const leaves = await leaveService.getPendingLeaves(req.user.organization);
    response.success(res, 'Pending leave requests retrieved', leaves);
  } catch (error) {
    next(error);
  }
};

const listLeaves = async (req, res, next) => {
  try {
    const filters = req.validatedQuery || req.query;
    const leaves = await leaveService.listLeaves(req.user.organization, filters);
    response.success(res, 'Leave requests retrieved', leaves);
  } catch (error) {
    next(error);
  }
};

const approveLeave = async (req, res, next) => {
  try {
    const payload = req.validatedData || req.body;
    const leave = await leaveService.approveLeave(req.user.organization, req.params.id, req.user.id, payload?.note);
    response.success(res, 'Leave approved', leave);
  } catch (error) {
    next(error);
  }
};

const rejectLeave = async (req, res, next) => {
  try {
    const payload = req.validatedData || req.body;
    const leave = await leaveService.rejectLeave(req.user.organization, req.params.id, req.user.id, payload?.note);
    await notificationService.createNotification({
      user: leave.staff,
      organization: req.user.organization,
      title: 'Leave request rejected',
      message: 'Your leave request was rejected by your manager.',
      type: 'leave_rejected',
      entityType: 'LeaveRequest',
      entityId: leave._id,
      link: '/leave-center'
    });
    response.success(res, 'Leave rejected', leave);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLeaveRequest,
  getMyLeaves,
  getPendingLeaves,
  listLeaves,
  approveLeave,
  rejectLeave
};
