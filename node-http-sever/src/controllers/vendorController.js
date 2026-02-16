// Vendor Controller
const vendorService = require('../services/vendorService');
const response = require('../utils/response');

const getVendors = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category, active } = req.query;
    const filters = {};
    
    if (category) filters.category = category;
    if (active !== undefined) filters.active = active === 'true';

    const result = await vendorService.getVendors(filters, parseInt(page), parseInt(limit));
    response.success(res, 'Vendors retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

const getVendorById = async (req, res, next) => {
  try {
    const vendor = await vendorService.getVendorById(req.params.id);
    response.success(res, 'Vendor retrieved successfully', vendor);
  } catch (error) {
    next(error);
  }
};

const createVendor = async (req, res, next) => {
  try {
    const vendor = await vendorService.createVendor(req.body);
    response.created(res, 'Vendor created successfully', vendor);
  } catch (error) {
    next(error);
  }
};

const updateVendor = async (req, res, next) => {
  try {
    const vendor = await vendorService.updateVendor(req.params.id, req.body);
    response.success(res, 'Vendor updated successfully', vendor);
  } catch (error) {
    next(error);
  }
};

const deleteVendor = async (req, res, next) => {
  try {
    await vendorService.deleteVendor(req.params.id);
    response.success(res, 'Vendor deleted successfully', null);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getVendors,
  getVendorById,
  createVendor,
  updateVendor,
  deleteVendor
};
