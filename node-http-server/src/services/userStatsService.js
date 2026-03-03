// User Stats Service
const User = require('../models/User');
const WorkOrder = require('../models/WorkOrder');

const computeWorkOrderStats = async (organizationId, userId) => {
  const [assignedOrders, completedOrders] = await Promise.all([
    WorkOrder.countDocuments({ organization: organizationId, assignedTo: userId }),
    WorkOrder.countDocuments({ organization: organizationId, assignedTo: userId, status: 'completed' })
  ]);
  const performanceScore = assignedOrders
    ? Math.round((completedOrders / assignedOrders) * 100)
    : 0;
  const rating = Math.round((performanceScore / 100) * 50) / 10;
  return { assignedOrders, completedOrders, performanceScore, rating };
};

const refreshUserStats = async ({ organizationId, userId }) => {
  if (!organizationId || !userId) return null;
  const stats = await computeWorkOrderStats(organizationId, userId);
  const user = await User.findOne({ _id: userId, organization: organizationId }).select('certificates lastLogin updatedAt createdAt');
  if (!user) return null;
  const certificationsCount = Array.isArray(user.certificates) ? user.certificates.length : 0;
  const lastActive = user.lastLogin || user.updatedAt || user.createdAt;
  const updates = {
    performanceScore: stats.performanceScore,
    rating: stats.rating,
    completedOrders: stats.completedOrders,
    assignedOrders: stats.assignedOrders,
    certificationsCount,
    lastActive
  };
  await User.updateOne({ _id: userId }, { $set: updates });
  return updates;
};

const refreshUsersStats = async ({ organizationId, userIds = [] }) => {
  const uniqueIds = Array.from(new Set((userIds || []).filter(Boolean)));
  if (!uniqueIds.length) return [];
  const results = [];
  for (const id of uniqueIds) {
    const updated = await refreshUserStats({ organizationId, userId: id });
    if (updated) results.push({ userId: id, ...updated });
  }
  return results;
};

module.exports = {
  refreshUserStats,
  refreshUsersStats
};
