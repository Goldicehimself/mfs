// Asset Controller
const assetService = require('../services/assetService');
const response = require('../utils/response');

const getAssets = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, category, search } = req.query;
    const filters = {};
    
    if (status) filters.status = status;
    if (category) filters.category = category;

    let result;
    if (search) {
      result = await assetService.searchAssets(search, parseInt(page), parseInt(limit));
    } else {
      result = await assetService.getAssets(filters, parseInt(page), parseInt(limit));
    }

    response.success(res, 'Assets retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

const getAssetById = async (req, res, next) => {
  try {
    const asset = await assetService.getAssetById(req.params.id);
    response.success(res, 'Asset retrieved successfully', asset);
  } catch (error) {
    next(error);
  }
};

const createAsset = async (req, res, next) => {
  try {
    const asset = await assetService.createAsset(req.body);
    response.created(res, 'Asset created successfully', asset);
  } catch (error) {
    next(error);
  }
};

const updateAsset = async (req, res, next) => {
  try {
    const asset = await assetService.updateAsset(req.params.id, req.body);
    response.success(res, 'Asset updated successfully', asset);
  } catch (error) {
    next(error);
  }
};

const deleteAsset = async (req, res, next) => {
  try {
    await assetService.deleteAsset(req.params.id);
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
