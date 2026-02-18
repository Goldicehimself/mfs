// Asset Service
const Asset = require('../models/Asset');
const { NotFoundError } = require('../utils/errorHandler');

const getAssets = async (organizationId, filters = {}, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const scopedFilters = { ...filters, organization: organizationId };
  
  const query = Asset.find(scopedFilters)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const [assets, total] = await Promise.all([
    query.exec(),
    Asset.countDocuments(scopedFilters)
  ]);

  return {
    assets,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

const getAssetById = async (organizationId, id) => {
  const asset = await Asset.findOne({ _id: id, organization: organizationId }).populate('owner');
  if (!asset) {
    throw new NotFoundError('Asset');
  }
  return asset;
};

const createAsset = async (organizationId, assetData) => {
  assetData.organization = organizationId;
  const asset = new Asset(assetData);
  await asset.save();
  return asset;
};

const updateAsset = async (organizationId, id, updateData) => {
  const asset = await Asset.findOneAndUpdate({ _id: id, organization: organizationId }, updateData, {
    new: true,
    runValidators: true
  });
  if (!asset) {
    throw new NotFoundError('Asset');
  }
  return asset;
};

const deleteAsset = async (organizationId, id) => {
  const asset = await Asset.findOneAndDelete({ _id: id, organization: organizationId });
  if (!asset) {
    throw new NotFoundError('Asset');
  }
  return asset;
};

const searchAssets = async (organizationId, query, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  
  const assets = await Asset.find(
    { $text: { $search: query }, organization: organizationId },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' } })
    .skip(skip)
    .limit(limit);

  const total = await Asset.countDocuments({ $text: { $search: query }, organization: organizationId });

  return {
    assets,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

module.exports = {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
  searchAssets
};
