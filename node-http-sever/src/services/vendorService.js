// Vendor Service
const Vendor = require('../models/Vendor');
const { NotFoundError } = require('../utils/errorHandler');

const getVendors = async (filters = {}, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  
  const query = Vendor.find(filters)
    .skip(skip)
    .limit(limit)
    .sort({ name: 1 });

  const [vendors, total] = await Promise.all([
    query.exec(),
    Vendor.countDocuments(filters)
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

const getVendorById = async (id) => {
  const vendor = await Vendor.findById(id);
  if (!vendor) {
    throw new NotFoundError('Vendor');
  }
  return vendor;
};

const createVendor = async (vendorData) => {
  const vendor = new Vendor(vendorData);
  await vendor.save();
  return vendor;
};

const updateVendor = async (id, updateData) => {
  const vendor = await Vendor.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true
  });
  if (!vendor) {
    throw new NotFoundError('Vendor');
  }
  return vendor;
};

const deleteVendor = async (id) => {
  const vendor = await Vendor.findByIdAndDelete(id);
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
