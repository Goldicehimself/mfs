// Preventive Maintenance Controller
const preventiveMaintenanceService = require('../services/preventiveMaintenanceService');
const response = require('../utils/response');

const getPreventiveMaintenances = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, active, asset } = req.query;
    const filters = {};
    
    if (active !== undefined) filters.active = active === 'true';
    if (asset) filters.asset = asset;

    const result = await preventiveMaintenanceService.getPreventiveMaintenances(
      filters,
      parseInt(page),
      parseInt(limit)
    );
    response.success(res, 'Preventive maintenances retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

const getPreventiveMaintenanceById = async (req, res, next) => {
  try {
    const maintenance = await preventiveMaintenanceService.getPreventiveMaintenanceById(req.params.id);
    response.success(res, 'Preventive maintenance retrieved successfully', maintenance);
  } catch (error) {
    next(error);
  }
};

const createPreventiveMaintenance = async (req, res, next) => {
  try {
    const maintenance = await preventiveMaintenanceService.createPreventiveMaintenance(req.body);
    response.created(res, 'Preventive maintenance created successfully', maintenance);
  } catch (error) {
    next(error);
  }
};

const updatePreventiveMaintenance = async (req, res, next) => {
  try {
    const maintenance = await preventiveMaintenanceService.updatePreventiveMaintenance(
      req.params.id,
      req.body
    );
    response.success(res, 'Preventive maintenance updated successfully', maintenance);
  } catch (error) {
    next(error);
  }
};

const deletePreventiveMaintenance = async (req, res, next) => {
  try {
    await preventiveMaintenanceService.deletePreventiveMaintenance(req.params.id);
    response.success(res, 'Preventive maintenance deleted successfully', null);
  } catch (error) {
    next(error);
  }
};

const getUpcomingMaintenance = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const maintenances = await preventiveMaintenanceService.getUpcomingMaintenance(parseInt(days));
    response.success(res, 'Upcoming maintenances retrieved successfully', {
      maintenances,
      totalDays: parseInt(days)
    });
  } catch (error) {
    next(error);
  }
};

const markAsPerformed = async (req, res, next) => {
  try {
    const { notes } = req.body;
    const maintenance = await preventiveMaintenanceService.markAsPerformed(req.params.id, notes);
    response.success(res, 'Maintenance marked as performed successfully', maintenance);
  } catch (error) {
    next(error);
  }
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
