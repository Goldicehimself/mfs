// Asset Controller
const assetService = require('../services/assetService');
const response = require('../utils/response');
const activityService = require('../services/activityService');
const User = require('../models/User');
const { ValidationError } = require('../utils/errorHandler');

const ensureOwnerInOrg = async (organizationId, ownerId) => {
  if (!ownerId) return;
  const owner = await User.findOne({ _id: ownerId, organization: organizationId, active: true }).select('_id');
  if (!owner) {
    throw new ValidationError('Asset owner must belong to your organization and be active');
  }
};

const getAssets = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, category, search } = req.query;
    const filters = {};
    const organizationId = req.user.organization;
    
    if (status) filters.status = status;
    if (category) filters.category = category;

    let result;
    if (search) {
      result = await assetService.searchAssets(organizationId, search, parseInt(page), parseInt(limit));
    } else {
      result = await assetService.getAssets(organizationId, filters, parseInt(page), parseInt(limit));
    }

    response.success(res, 'Assets retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

const getAssetById = async (req, res, next) => {
  try {
    const asset = await assetService.getAssetById(req.user.organization, req.params.id);
    response.success(res, 'Asset retrieved successfully', asset);
  } catch (error) {
    next(error);
  }
};

const createAsset = async (req, res, next) => {
  try {
    const assetData = req.body;
    assetData.organization = req.user.organization;
    await ensureOwnerInOrg(req.user.organization, assetData.owner);
    if (req.file) {
      assetData.imageCover = req.file.path;
    }
    const asset = await assetService.createAsset(req.user.organization, assetData);
    activityService.broadcast({
      type: 'asset_created',
      message: `${asset.name || 'Asset'} created`,
      entityType: 'Asset',
      entityId: asset._id,
      link: `/assets/${asset._id}`,
      createdAt: new Date().toISOString()
    });
    response.created(res, 'Asset created successfully', asset);
  } catch (error) {
    next(error);
  }
};

const updateAsset = async (req, res, next) => {
  try {
    const updateData = req.body;
    await ensureOwnerInOrg(req.user.organization, updateData.owner);
    if (req.file) {
      updateData.imageCover = req.file.path;
    }
    const asset = await assetService.updateAsset(req.user.organization, req.params.id, updateData);
    activityService.broadcast({
      type: 'asset_updated',
      message: `${asset.name || 'Asset'} updated`,
      entityType: 'Asset',
      entityId: asset._id,
      link: `/assets/${asset._id}`,
      createdAt: new Date().toISOString()
    });
    response.success(res, 'Asset updated successfully', asset);
  } catch (error) {
    next(error);
  }
};

const deleteAsset = async (req, res, next) => {
  try {
    const deleted = await assetService.deleteAsset(req.user.organization, req.params.id);
    activityService.broadcast({
      type: 'asset_deleted',
      message: `${deleted.name || 'Asset'} deleted`,
      entityType: 'Asset',
      entityId: deleted._id,
      link: `/assets/${deleted._id}`,
      createdAt: new Date().toISOString()
    });
    response.success(res, 'Asset deleted successfully', null);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset
};
