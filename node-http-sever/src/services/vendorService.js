// Vendor Service
const Vendor = require('../models/Vendor');
const { NotFoundError } = require('../utils/errorHandler');

const getVendors = async (organizationId, filters = {}, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const scopedFilters = { ...filters, organization: organizationId };
  
  const query = Vendor.find(scopedFilters)
    .skip(skip)
    .limit(limit)
    .sort({ name: 1 });

  const [vendors, total] = await Promise.all([
    query.exec(),
    Vendor.countDocuments(scopedFilters)
  ]);

  return {
    vendors,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

const getVendorById = async (organizationId, id) => {
  const vendor = await Vendor.findOne({ _id: id, organization: organizationId });
  if (!vendor) {
    throw new NotFoundError('Vendor');
  }
  return vendor;
};

const createVendor = async (organizationId, vendorData) => {
  vendorData.organization = organizationId;
  const vendor = new Vendor(vendorData);
  await vendor.save();
  return vendor;
};

const updateVendor = async (organizationId, id, updateData) => {
  const vendor = await Vendor.findOneAndUpdate({ _id: id, organization: organizationId }, updateData, {
    new: true,
    runValidators: true
  });
  if (!vendor) {
    throw new NotFoundError('Vendor');
  }
  return vendor;
};

const deleteVendor = async (organizationId, id) => {
  const vendor = await Vendor.findOneAndDelete({ _id: id, organization: organizationId });
  if (!vendor) {
    throw new NotFoundError('Vendor');
  }
  return vendor;
};

module.exports = {
  getVendors,
  getVendorById,
  createVendor,
  updateVendor,
  deleteVendor
};
