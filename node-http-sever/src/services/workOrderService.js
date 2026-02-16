// Work Order Service
const WorkOrder = require('../models/WorkOrder');
const { NotFoundError } = require('../utils/errorHandler');

const generateWorkOrderNumber = async () => {
  const lastWO = await WorkOrder.findOne().sort({ createdAt: -1 });
  const lastNum = lastWO?.workOrderNumber?.match(/\d+$/)?.[0] || '0';
  const newNum = String(parseInt(lastNum) + 1).padStart(5, '0');
  return `WO-${newNum}`;
};

const getWorkOrders = async (filters = {}, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  
  const query = WorkOrder.find(filters)
    .populate('createdBy assignedTo asset')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const [workOrders, total] = await Promise.all([
    query.exec(),
    WorkOrder.countDocuments(filters)
  ]);

  return {
    workOrders,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

const getWorkOrderById = async (id) => {
  const workOrder = await WorkOrder.findById(id)
    .populate('createdBy assignedTo asset');
  if (!workOrder) {
    throw new NotFoundError('WorkOrder');
  }
  return workOrder;
};

const createWorkOrder = async (workOrderData) => {
  workOrderData.workOrderNumber = await generateWorkOrderNumber();
  const workOrder = new WorkOrder(workOrderData);
  await workOrder.save();
  await workOrder.populate('createdBy assignedTo asset');
  return workOrder;
};

const updateWorkOrder = async (id, updateData) => {
  updateData.updatedAt = new Date();
  const workOrder = await WorkOrder.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true
  }).populate('createdBy assignedTo asset');
  
  if (!workOrder) {
    throw new NotFoundError('WorkOrder');
  }
  return workOrder;
};

const updateWorkOrderStatus = async (id, status, notes = '') => {
  const updateData = { status, updatedAt: new Date() };
  if (notes) updateData.notes = notes;
  
  if (status === 'completed') {
    updateData.completionDate = new Date();
  }

  return updateWorkOrder(id, updateData);
};

const assignWorkOrder = async (id, assigneeId) => {
  return updateWorkOrder(id, { 
    assignedTo: assigneeId,
    status: 'assigned'
  });
};

const deleteWorkOrder = async (id) => {
  const workOrder = await WorkOrder.findByIdAndDelete(id);
  if (!workOrder) {
    throw new NotFoundError('WorkOrder');
  }
  return workOrder;
};

const addComment = async (id, userId, text) => {
  const workOrder = await WorkOrder.findById(id);
  if (!workOrder) {
    throw new NotFoundError('WorkOrder');
  }

  workOrder.comments.push({
    user: userId,
    text,
    createdAt: new Date()
  });

  await workOrder.save();
  await workOrder.populate('comments.user');
  return workOrder;
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
  generateWorkOrderNumber
};
