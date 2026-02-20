// Work Order Controller
const workOrderService = require('../services/workOrderService');
const response = require('../utils/response');
const { ValidationError, AuthorizationError } = require('../utils/errorHandler');
const constants = require('../constants/constants');
const path = require('path');
const notificationService = require('../services/notificationService');
const activityService = require('../services/activityService');
const webhookService = require('../services/webhookService');
const User = require('../models/User');
const Asset = require('../models/Asset');

const ensureUsersInOrg = async (organizationId, userIds = []) => {
  if (!userIds || userIds.length === 0) return;
  const uniqueIds = [...new Set(userIds.filter(Boolean).map((id) => id.toString()))];
  if (!uniqueIds.length) return;
  const count = await User.countDocuments({
    _id: { $in: uniqueIds },
    organization: organizationId,
    active: true
  });
  if (count !== uniqueIds.length) {
    throw new ValidationError('One or more users are outside your organization or inactive');
  }
};

const ensureAssetInOrg = async (organizationId, assetId) => {
  if (!assetId) throw new ValidationError('Asset is required');
  const asset = await Asset.findOne({ _id: assetId, organization: organizationId }).select('_id');
  if (!asset) {
    throw new ValidationError('Asset does not belong to your organization');
  }
};

const getOrgAdminId = async (organizationId) => {
  const admin = await User.findOne({ organization: organizationId, role: constants.ROLES.ADMIN }).select('_id');
  return admin?._id;
};

const getWorkOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, priority, assignedTo } = req.query;
    const filters = {};
    const organizationId = req.user.organization;
    
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (assignedTo) filters.assignedTo = assignedTo;
    if (req.user?.role === constants.ROLES.TECHNICIAN) {
      filters.$or = [{ assignedTo: req.user.id }, { team: req.user.id }];
    }

    const result = await workOrderService.getWorkOrders(organizationId, filters, parseInt(page), parseInt(limit));
    response.success(res, 'Work orders retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

const getWorkOrderById = async (req, res, next) => {
  try {
    const workOrder = await workOrderService.getWorkOrderById(req.user.organization, req.params.id);
    if (req.user?.role === constants.ROLES.TECHNICIAN) {
      const assignedToId = workOrder.assignedTo?._id?.toString();
      const teamIds = (workOrder.team || []).map((member) => member._id?.toString?.() || member.toString());
      if (assignedToId !== req.user.id && !teamIds.includes(req.user.id)) {
        throw new AuthorizationError('Access denied');
      }
    }
    response.success(res, 'Work order retrieved successfully', workOrder);
  } catch (error) {
    next(error);
  }
};

const createWorkOrder = async (req, res, next) => {
  try {
    await ensureAssetInOrg(req.user.organization, req.body.asset);
    await ensureUsersInOrg(req.user.organization, [
      req.body.assignedTo,
      ...(req.body.team || [])
    ]);
    if (req.user?.authType === 'api_key') {
      req.body.createdBy = await getOrgAdminId(req.user.organization);
    } else {
      req.body.createdBy = req.user.id;
    }
    const workOrder = await workOrderService.createWorkOrder(req.user.organization, req.body);
    webhookService.emitWebhookEvent(req.user.organization, 'workorder.created', { workOrder });
    activityService.broadcast({
      type: 'workorder_created',
      message: `${workOrder.title} created`,
      entityType: 'WorkOrder',
      entityId: workOrder._id,
      link: `/work-orders/${workOrder._id}`,
      createdAt: new Date().toISOString()
    });
    response.created(res, 'Work order created successfully', workOrder);
  } catch (error) {
    next(error);
  }
};

const updateWorkOrder = async (req, res, next) => {
  try {
    if (req.body.asset) {
      await ensureAssetInOrg(req.user.organization, req.body.asset);
    }
    if (req.body.assignedTo || req.body.team) {
      await ensureUsersInOrg(req.user.organization, [
        req.body.assignedTo,
        ...(req.body.team || [])
      ]);
    }
    const workOrder = await workOrderService.updateWorkOrder(req.user.organization, req.params.id, req.body);
    activityService.broadcast({
      type: 'workorder_updated',
      message: `${workOrder.title} updated`,
      entityType: 'WorkOrder',
      entityId: workOrder._id,
      link: `/work-orders/${workOrder._id}`,
      createdAt: new Date().toISOString()
    });
    response.success(res, 'Work order updated successfully', workOrder);
  } catch (error) {
    next(error);
  }
};

const updateWorkOrderStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const workOrder = await workOrderService.updateWorkOrderStatus(req.user.organization, req.params.id, status, notes);
    webhookService.emitWebhookEvent(req.user.organization, 'workorder.status_changed', { workOrder, status });
    const recipients = [
      workOrder.createdBy?._id,
      workOrder.assignedTo?._id,
      ...(workOrder.team || []).map((member) => member?._id)
    ].filter(Boolean).map((id) => id.toString());
    const uniqueRecipients = [...new Set(recipients)].filter((id) => id !== req.user.id);

    await notificationService.createNotificationsForUsers(uniqueRecipients, {
      organization: req.user.organization,
      title: 'Work order status updated',
      message: `${workOrder.title} status changed to ${status}`,
      type: 'workorder_status',
      entityType: 'WorkOrder',
      entityId: workOrder._id,
      link: `/work-orders/${workOrder._id}`
    });
    activityService.broadcast({
      type: 'workorder_status',
      message: `${workOrder.title} status changed to ${status}`,
      entityType: 'WorkOrder',
      entityId: workOrder._id,
      link: `/work-orders/${workOrder._id}`,
      createdAt: new Date().toISOString()
    });
    response.success(res, 'Work order status updated successfully', workOrder);
  } catch (error) {
    next(error);
  }
};

const assignWorkOrder = async (req, res, next) => {
  try {
    const { assigneeId } = req.body;
    await ensureUsersInOrg(req.user.organization, [assigneeId]);
    const workOrder = await workOrderService.assignWorkOrder(req.user.organization, req.params.id, assigneeId);
    webhookService.emitWebhookEvent(req.user.organization, 'workorder.assigned', { workOrder, assigneeId });
    if (workOrder.assignedTo?._id) {
      await notificationService.createNotification({
        user: workOrder.assignedTo._id,
        organization: req.user.organization,
        title: 'Work order assigned',
        message: `${workOrder.title} has been assigned to you`,
        type: 'workorder_assigned',
        entityType: 'WorkOrder',
        entityId: workOrder._id,
        link: `/work-orders/${workOrder._id}`
      });
    }
    activityService.broadcast({
      type: 'workorder_assigned',
      message: `${workOrder.title} assigned`,
      entityType: 'WorkOrder',
      entityId: workOrder._id,
      link: `/work-orders/${workOrder._id}`,
      createdAt: new Date().toISOString()
    });
    response.success(res, 'Work order assigned successfully', workOrder);
  } catch (error) {
    next(error);
  }
};

const deleteWorkOrder = async (req, res, next) => {
  try {
    const deleted = await workOrderService.deleteWorkOrder(req.user.organization, req.params.id);
    activityService.broadcast({
      type: 'workorder_deleted',
      message: `${deleted.title} deleted`,
      entityType: 'WorkOrder',
      entityId: deleted._id,
      link: `/work-orders/${deleted._id}`,
      createdAt: new Date().toISOString()
    });
    response.success(res, 'Work order deleted successfully', null);
  } catch (error) {
    next(error);
  }
};

const addComment = async (req, res, next) => {
  try {
    const { comment } = req.body;
    const workOrder = await workOrderService.addComment(req.user.organization, req.params.id, req.user.id, comment);
    const recipients = [
      workOrder.createdBy?._id,
      workOrder.assignedTo?._id,
      ...(workOrder.team || []).map((member) => member?._id)
    ].filter(Boolean).map((id) => id.toString());
    const uniqueRecipients = [...new Set(recipients)].filter((id) => id !== req.user.id);

    await notificationService.createNotificationsForUsers(uniqueRecipients, {
      organization: req.user.organization,
      title: 'New comment on work order',
      message: `${workOrder.title} has a new comment`,
      type: 'workorder_comment',
      entityType: 'WorkOrder',
      entityId: workOrder._id,
      link: `/work-orders/${workOrder._id}`
    });
    activityService.broadcast({
      type: 'workorder_comment',
      message: `${workOrder.title} has a new comment`,
      entityType: 'WorkOrder',
      entityId: workOrder._id,
      link: `/work-orders/${workOrder._id}`,
      createdAt: new Date().toISOString()
    });
    response.created(res, 'Comment added successfully', workOrder);
  } catch (error) {
    next(error);
  }
};

const addWorkOrderPhotos = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      throw new ValidationError('At least one photo is required');
    }

    const filePaths = req.files.map((file) => file.path.split(path.sep).join('/'));
    const workOrder = await workOrderService.addWorkOrderPhotos(req.user.organization, req.params.id, filePaths);
    response.success(res, 'Work order photos uploaded successfully', workOrder);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWorkOrders,
  getWorkOrderById,
  createWorkOrder,
  updateWorkOrder,
  updateWorkOrderStatus,
  assignWorkOrder,
  deleteWorkOrder,
  addComment,
  addWorkOrderPhotos
};
