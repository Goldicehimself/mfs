// Preventive Maintenance Service
const PreventiveMaintenance = require('../models/PreventiveMaintenance');
const { NotFoundError } = require('../utils/errorHandler');

const getPreventiveMaintenances = async (filters = {}, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  
  const query = PreventiveMaintenance.find(filters)
    .populate('asset assignedTo')
    .skip(skip)
    .limit(limit)
    .sort({ nextDueDate: 1 });

  const [maintenances, total] = await Promise.all([
    query.exec(),
    PreventiveMaintenance.countDocuments(filters)
  ]);

  return {
    maintenances,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

const getPreventiveMaintenanceById = async (id) => {
  const maintenance = await PreventiveMaintenance.findById(id)
    .populate('asset assignedTo');
  if (!maintenance) {
    throw new NotFoundError('PreventiveMaintenance');
  }
  return maintenance;
};

const createPreventiveMaintenance = async (maintenanceData) => {
  const maintenance = new PreventiveMaintenance(maintenanceData);
  await maintenance.save();
  await maintenance.populate('asset assignedTo');
  return maintenance;
};

const updatePreventiveMaintenance = async (id, updateData) => {
  updateData.updatedAt = new Date();
  const maintenance = await PreventiveMaintenance.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true
  }).populate('asset assignedTo');
  
  if (!maintenance) {
    throw new NotFoundError('PreventiveMaintenance');
  }
  return maintenance;
};

const deletePreventiveMaintenance = async (id) => {
  const maintenance = await PreventiveMaintenance.findByIdAndDelete(id);
  if (!maintenance) {
    throw new NotFoundError('PreventiveMaintenance');
  }
  return maintenance;
};

const getUpcomingMaintenance = async (days = 30) => {
  const now = new Date();
  const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  const maintenances = await PreventiveMaintenance.find({
    active: true,
    nextDueDate: { $gte: now, $lte: futureDate }
  })
    .populate('asset assignedTo')
    .sort({ nextDueDate: 1 });

  return maintenances;
};

const markAsPerformed = async (id, notes = '') => {
  const maintenance = await PreventiveMaintenance.findById(id);
  if (!maintenance) {
    throw new NotFoundError('PreventiveMaintenance');
  }

  maintenance.lastPerformed = new Date();
  
  // Calculate next due date based on frequency
  const frequencyDays = {
    'weekly': 7,
    'bi-weekly': 14,
    'monthly': 30,
    'quarterly': 91,
    'semi-annual': 183,
    'annual': 365
  };

  const daysToAdd = frequencyDays[maintenance.frequency] || 30;
  maintenance.nextDueDate = new Date(maintenance.lastPerformed.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
  
  await maintenance.save();
  await maintenance.populate('asset assignedTo');
  return maintenance;
};

module.exports = {
  getPreventiveMaintenances,
  getPreventiveMaintenanceById,
  createPreventiveMaintenance,
  updatePreventiveMaintenance,
  deletePreventiveMaintenance,
  getUpcomingMaintenance,
  markAsPerformed
};
