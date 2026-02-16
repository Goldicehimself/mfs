// Work Order Controller
const workOrderService = require('../services/workOrderService');
const response = require('../utils/response');

const getWorkOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, priority, assignedTo } = req.query;
    const filters = {};
    
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (assignedTo) filters.assignedTo = assignedTo;

    const result = await workOrderService.getWorkOrders(filters, parseInt(page), parseInt(limit));
    response.success(res, 'Work orders retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

const getWorkOrderById = async (req, res, next) => {
  try {
    const workOrder = await workOrderService.getWorkOrderById(req.params.id);
    response.success(res, 'Work order retrieved successfully', workOrder);
  } catch (error) {
    next(error);
  }
};

const createWorkOrder = async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id;
    const workOrder = await workOrderService.createWorkOrder(req.body);
    response.created(res, 'Work order created successfully', workOrder);
  } catch (error) {
    next(error);
  }
};

const updateWorkOrder = async (req, res, next) => {
  try {
    const workOrder = await workOrderService.updateWorkOrder(req.params.id, req.body);
    response.success(res, 'Work order updated successfully', workOrder);
  } catch (error) {
    next(error);
  }
};

const updateWorkOrderStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const workOrder = await workOrderService.updateWorkOrderStatus(req.params.id, status, notes);
    response.success(res, 'Work order status updated successfully', workOrder);
  } catch (error) {
    next(error);
  }
};

const assignWorkOrder = async (req, res, next) => {
  try {
    const { assigneeId } = req.body;
    const workOrder = await workOrderService.assignWorkOrder(req.params.id, assigneeId);
    response.success(res, 'Work order assigned successfully', workOrder);
  } catch (error) {
    next(error);
  }
};

const deleteWorkOrder = async (req, res, next) => {
  try {
    await workOrderService.deleteWorkOrder(req.params.id);
    response.success(res, 'Work order deleted successfully', null);
  } catch (error) {
    next(error);
  }
};

const addComment = async (req, res, next) => {
  try {
    const { comment } = req.body;
    const workOrder = await workOrderService.addComment(req.params.id, req.user.id, comment);
    response.created(res, 'Comment added successfully', workOrder);
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
  addComment
};
