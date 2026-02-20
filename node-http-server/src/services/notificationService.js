// Notification Service
const Notification = require('../models/Notification');
const WorkOrder = require('../models/WorkOrder');
const PreventiveMaintenance = require('../models/PreventiveMaintenance');
const User = require('../models/User');
const constants = require('../constants/constants');

const createNotification = async (payload) => {
  try {
    return await Notification.create(payload);
  } catch (error) {
    if (error.code === 11000) {
      return null;
    }
    throw error;
  }
};

const createNotificationsForUsers = async (userIds, payload) => {
  if (!userIds || userIds.length === 0) return [];
  const docs = userIds.map((userId) => ({ ...payload, user: userId }));
  try {
    return await Notification.insertMany(docs, { ordered: false });
  } catch (error) {
    if (error.code === 11000) {
      return [];
    }
    throw error;
  }
};

const getNotifications = async (organizationId, userId, page = 1, limit = 20, unreadOnly = false) => {
  const skip = (page - 1) * limit;
  const filter = { user: userId, organization: organizationId };
  if (unreadOnly) filter.read = false;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments(filter),
    Notification.countDocuments({ user: userId, organization: organizationId, read: false })
  ]);

  return {
    notifications,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    },
    unreadCount
  };
};

const markRead = async (organizationId, userId, notificationId) => {
  return Notification.findOneAndUpdate(
    { _id: notificationId, user: userId, organization: organizationId },
    { read: true },
    { new: true }
  );
};

const markAllRead = async (organizationId, userId) => {
  return Notification.updateMany({ user: userId, organization: organizationId, read: false }, { read: true });
};

const getRoleUserIds = async (roles = [], organizationId) => {
  if (!roles.length) return [];
  const users = await User.find({ role: { $in: roles }, organization: organizationId }).select('_id');
  return users.map((u) => u._id);
};

const ensureDueSoonNotifications = async (user, days = 7) => {
  const now = new Date();
  const due = new Date();
  due.setDate(due.getDate() + days);

  const workOrderFilter = {
    organization: user.organization,
    dueDate: { $gte: now, $lte: due },
    status: { $nin: [constants.WORK_ORDER_STATUS.COMPLETED, constants.WORK_ORDER_STATUS.CANCELLED] }
  };

  if (user.role === constants.ROLES.ADMIN || user.role === constants.ROLES.FACILITY_MANAGER) {
    // no extra filter
  } else if (user.role === constants.ROLES.TECHNICIAN || user.role === constants.ROLES.VENDOR) {
    workOrderFilter.$or = [
      { assignedTo: user.id },
      { team: user.id },
      { createdBy: user.id }
    ];
  } else {
    return;
  }

  const workOrders = await WorkOrder.find(workOrderFilter).select('_id title dueDate');
  for (const workOrder of workOrders) {
    await createNotification({
      user: user.id,
      organization: user.organization,
      title: 'Work order due soon',
      message: `${workOrder.title} is due soon`,
      type: 'workorder_due_soon',
      entityType: 'WorkOrder',
      entityId: workOrder._id,
      link: `/work-orders/${workOrder._id}`,
      dedupeKey: `workorder-due-${workOrder._id}`
    });
  }

  const maintenanceFilter = {
    organization: user.organization,
    nextDueDate: { $gte: now, $lte: due },
    active: true
  };

  if (user.role === constants.ROLES.ADMIN || user.role === constants.ROLES.FACILITY_MANAGER) {
    // no extra filter
  } else if (user.role === constants.ROLES.TECHNICIAN || user.role === constants.ROLES.VENDOR) {
    maintenanceFilter.assignedTo = user.id;
  } else {
    return;
  }

  const maintenances = await PreventiveMaintenance.find(maintenanceFilter).select('_id name nextDueDate');
  for (const maintenance of maintenances) {
    await createNotification({
      user: user.id,
      organization: user.organization,
      title: 'Maintenance due soon',
      message: `${maintenance.name} is due soon`,
      type: 'maintenance_due_soon',
      entityType: 'PreventiveMaintenance',
      entityId: maintenance._id,
      link: `/preventive-maintenance/${maintenance._id}`,
      dedupeKey: `maintenance-due-${maintenance._id}`
    });
  }
};

module.exports = {
  createNotification,
  createNotificationsForUsers,
  getNotifications,
  markRead,
  markAllRead,
  getRoleUserIds,
  ensureDueSoonNotifications
};
