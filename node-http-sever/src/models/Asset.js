// Asset Model
const mongoose = require('mongoose');
const constants = require('../config/constants');

const assetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Asset name is required'],
    trim: true
  },
  assetNumber: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  description: String,
  category: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  serialNumber: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  manufacturer: String,
  modelNumber: String,
  purchaseDate: Date,
  purchasePrice: Number,
  status: {
    type: String,
    enum: Object.values(constants.ASSET_STATUS),
    default: constants.ASSET_STATUS.ACTIVE
  },
  condition: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor'],
    default: 'good'
  },
  images: [String],
  qrCode: String,
  maintenanceHistory: [{
    date: Date,
    description: String,
    technician: mongoose.Schema.Types.ObjectId,
    cost: Number
  }],
  nextMaintenanceDate: Date,
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  department: String,
  tags: [String],
  customFields: mongoose.Schema.Types.Mixed,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for frequently searched fields
assetSchema.index({ name: 'text', description: 'text', assetNumber: 1 });
assetSchema.index({ status: 1, category: 1 });

module.exports = mongoose.model('Asset', assetSchema);
