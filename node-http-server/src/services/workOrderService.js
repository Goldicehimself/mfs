// Work Order Service
const WorkOrder = require('../models/WorkOrder');
const { NotFoundError } = require('../utils/errorHandler');

const generateWorkOrderNumber = async (organizationId) => {
  const lastWO = await WorkOrder.findOne({ organization: organizationId }).sort({ createdAt: -1 });
  const lastNum = lastWO?.workOrderNumber?.match(/\d+$/)?.[0] || '0';
  const newNum = String(parseInt(lastNum) + 1).padStart(5, '0');
  return `WO-${newNum}`;
};

const getWorkOrders = async (organizationId, filters = {}, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const scopedFilters = { ...filters, organization: organizationId };
  
  const query = WorkOrder.find(scopedFilters)
    .populate('createdBy assignedTo asset team')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const [workOrders, total] = await Promise.all([
    query.exec(),
    WorkOrder.countDocuments(scopedFilters)
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

const getWorkOrderById = async (organizationId, id) => {
  const workOrder = await WorkOrder.findOne({ _id: id, organization: organizationId })
    .populate('createdBy assignedTo asset team');
  if (!workOrder) {
    throw new NotFoundError('WorkOrder');
  }
  return workOrder;
};

const createWorkOrder = async (organizationId, workOrderData) => {
  workOrderData.organization = organizationId;
  workOrderData.workOrderNumber = await generateWorkOrderNumber(organizationId);
  const workOrder = new WorkOrder(workOrderData);
  await workOrder.save();
  await workOrder.populate('createdBy assignedTo asset');
  return workOrder;
};

const updateWorkOrder = async (organizationId, id, updateData) => {
  updateData.updatedAt = new Date();
  const workOrder = await WorkOrder.findOneAndUpdate({ _id: id, organization: organizationId }, updateData, {
    new: true,
    runValidators: true
  }).populate('createdBy assignedTo asset');
  
  if (!workOrder) {
    throw new NotFoundError('WorkOrder');
  }
  return workOrder;
};

const updateWorkOrderStatus = async (organizationId, id, status, notes = '') => {
  const updateData = { status, updatedAt: new Date() };
  if (notes) updateData.notes = notes;
  
  if (status === 'completed') {
    updateData.completionDate = new Date();
  }

  return updateWorkOrder(organizationId, id, updateData);
};

const assignWorkOrder = async (organizationId, id, assigneeId) => {
  return updateWorkOrder(organizationId, id, { 
    assignedTo: assigneeId,
    status: 'assigned'
  });
};

const deleteWorkOrder = async (organizationId, id) => {
  const workOrder = await WorkOrder.findOneAndDelete({ _id: id, organization: organizationId });
  if (!workOrder) {
    throw new NotFoundError('WorkOrder');
  }
  return workOrder;
};

const getOverdueWorkOrders = async () => {
  const now = new Date();
  return WorkOrder.find({
    dueDate: { $lt: now },
    status: { $nin: ['completed', 'cancelled'] },
    $or: [{ overdueNotifiedAt: null }, { overdueNotifiedAt: { $exists: false } }]
  }).populate('createdBy assignedTo asset');
};

const markOverdueNotified = async (workOrderIds = []) => {
  if (!workOrderIds.length) return;
  await WorkOrder.updateMany(
    { _id: { $in: workOrderIds } },
    { $set: { overdueNotifiedAt: new Date() } }
  );
};

const addComment = async (organizationId, id, userId, text) => {
  const workOrder = await WorkOrder.findOne({ _id: id, organization: organizationId });
  if (!workOrder) {
    throw new NotFoundError('WorkOrder');
  }

  workOrder.comments.push({
    user: userId,
    text,
    createdAt: new Date()
  });

  await workOrder.save();
  await workOrder.populate('comments.user createdBy assignedTo asset team');
  return workOrder;
};

const addWorkOrderPhotos = async (organizationId, id, filePaths = []) => {
  const workOrder = await WorkOrder.findOneAndUpdate(
    { _id: id, organization: organizationId },
    {
      $addToSet: { photos: { $each: filePaths } },
      updatedAt: new Date()
    },
    { new: true, runValidators: true }
  ).populate('createdBy assignedTo asset');

  if (!workOrder) {
    throw new NotFoundError('WorkOrder');
  }
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
  addWorkOrderPhotos,
  generateWorkOrderNumber,
  getOverdueWorkOrders,
  markOverdueNotified
};
