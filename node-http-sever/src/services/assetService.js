// Asset Service
const Asset = require('../models/Asset');
const { NotFoundError } = require('../utils/errorHandler');

const getAssets = async (filters = {}, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  
  const query = Asset.find(filters)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const [assets, total] = await Promise.all([
    query.exec(),
    Asset.countDocuments(filters)
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

const getAssetById = async (id) => {
  const asset = await Asset.findById(id).populate('owner');
  if (!asset) {
    throw new NotFoundError('Asset');
  }
  return asset;
};

const createAsset = async (assetData) => {
  const asset = new Asset(assetData);
  await asset.save();
  return asset;
};

const updateAsset = async (id, updateData) => {
  const asset = await Asset.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true
  });
  if (!asset) {
    throw new NotFoundError('Asset');
  }
  return asset;
};

const deleteAsset = async (id) => {
  const asset = await Asset.findByIdAndDelete(id);
  if (!asset) {
    throw new NotFoundError('Asset');
  }
  return asset;
};

const searchAssets = async (query, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  
  const assets = await Asset.find(
    { $text: { $search: query } },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' } })
    .skip(skip)
    .limit(limit);

  const total = await Asset.countDocuments({ $text: { $search: query } });

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
